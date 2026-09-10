# ROW-LEVEL SECURITY (RLS) & ISOLATION

PostgreSQL Row-Level Security (RLS) adalah garis pertahanan absolut di NotaryGo SaaS. Semua filter multi-tenant (`WHERE org_id = X`) ditegakkan secara otomatis oleh mesin database, terlepas dari bug yang mungkin terjadi di aplikasi frontend atau backend.

## 1. Helper Functions (PostgreSQL)

Untuk memastikan kebijakan keamanan bisa dieksekusi cepat dan konsisten, kita mendefinisikan *Helper Functions* di PostgreSQL:

```sql
-- Mendapatkan profile_id dari session Supabase saat ini
CREATE OR REPLACE FUNCTION auth.profile_id() RETURNS uuid AS $$
  SELECT auth.uid();
$$ LANGUAGE sql STABLE;

-- Mengecek apakah user adalah anggota dari org_id yang diminta
CREATE OR REPLACE FUNCTION public.is_org_member(check_org_id uuid) RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM organization_members 
    WHERE org_id = check_org_id AND profile_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Mengecek apakah user memiliki role spesifik di org_id
CREATE OR REPLACE FUNCTION public.has_org_role(check_org_id uuid, check_role text) RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM organization_members 
    WHERE org_id = check_org_id AND profile_id = auth.uid() AND role = check_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Mengecek apakah user adalah OWNER dari org_id
CREATE OR REPLACE FUNCTION public.is_org_owner(check_org_id uuid) RETURNS boolean AS $$
BEGIN
  RETURN public.has_org_role(check_org_id, 'OWNER');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
```

## 2. Default Tenant Isolation Policy (Contoh Penerapan)

Semua tabel transaksional (seperti `clients`, `matters`, `invoices`, `tasks`) WAJIB diaktifkan RLS-nya:
`ALTER TABLE clients ENABLE ROW LEVEL SECURITY;`

Kebijakan (Policy) standar yang diterapkan pada hampir seluruh tabel operasional:

```sql
-- POLICY: SELECT (Siapa saja yang merupakan member org dapat melihat)
CREATE POLICY "Members can view data" 
ON clients FOR SELECT 
USING ( public.is_org_member(org_id) );

-- POLICY: INSERT (Member org dapat menambah data, memastikan mereka memasukkan org_id yang benar)
CREATE POLICY "Members can insert data" 
ON clients FOR INSERT 
WITH CHECK ( public.is_org_member(org_id) );

-- POLICY: UPDATE (Hanya Admin atau Owner yang bisa mengedit, atau Staff sesuai delegasi)
CREATE POLICY "Admins can update data" 
ON clients FOR UPDATE 
USING ( public.has_org_role(org_id, 'ADMIN') OR public.is_org_owner(org_id) );

-- POLICY: DELETE (Hanya Owner/Admin yang bisa menghapus)
CREATE POLICY "Admins can delete data" 
ON clients FOR DELETE 
USING ( public.has_org_role(org_id, 'ADMIN') OR public.is_org_owner(org_id) );
```

## 3. Strict Delegation Policies (Task & Document)

Untuk tabel seperti `tasks` dan `documents`, aturan *Role-Based* lebih ketat:
- **Staff** hanya boleh melakukan UPDATE jika `tasks.assigned_to = auth.uid()`.

```sql
CREATE POLICY "Staff can update assigned tasks" 
ON tasks FOR UPDATE 
USING ( 
  public.is_org_member(org_id) 
  AND assigned_to = auth.uid() 
);
```

## 4. Protection Against Cross-Tenant Injection

Fungsi `is_org_member(org_id)` mencegah eksploitasi *IDOR (Insecure Direct Object Reference)*.
Jika *Tenant A* mencoba memanipulasi parameter URL (misalnya `DELETE /matters/UUID-MILIK-TENANT-B`), RLS akan otomatis mengevaluasi `is_org_member(UUID-MILIK-TENANT-B)`. Karena User A tidak ada di tabel `organization_members` milik Tenant B, Supabase (PostgreSQL) akan merespon dengan `0 rows affected` atau error unauthorized, sepenuhnya menggagalkan serangan.
