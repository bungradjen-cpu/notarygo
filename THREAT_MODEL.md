# THREAT MODEL & CROSS-TENANT ACCESS PREVENTION

Pemodelan ancaman (*Threat Modeling*) ini mengidentifikasi potensi eksploitasi multi-tenant pada NotaryGo SaaS dan menjelaskan penanggulangannya (*mitigation*) di arsitektur baru.

## 1. Identifikasi Ancaman (Threats)

### T1. Insecure Direct Object Reference (IDOR) / Cross-Tenant Data Leak
**Deskripsi**: User dari Tenant A memodifikasi HTTP Request atau API Payload untuk meminta `matter_id` milik Tenant B.
**Mitigasi**: Di layer database, PostgreSQL RLS mem-filter kueri: `WHERE id = {matter_id} AND is_org_member(org_id)`. Meskipun UUID valid, eksekusi SQL gagal membaca/menulis data tersebut. Server akan mereturn 404 (Not Found) atau 0 rows affected, membuat data Tenant B tidak terlihat secara kriptografis.

### T2. Token Theft / JWT Manipulation
**Deskripsi**: Penyerang memalsukan struktur JSON Web Token (JWT) untuk menyamar sebagai `SUPER_ADMIN` atau anggota Tenant lain.
**Mitigasi**: Supabase Auth menandatangani JWT menggunakan rahasia kriptografi (HMAC-SHA256). Token yang dimanipulasi `payload`-nya akan gagal validasi *signature* di API Gateway (Kong) dan ditolak sebelum menyentuh PostgreSQL.

### T3. SQL Injection (Bypassing RLS)
**Deskripsi**: Penyerang mencoba merusak query menggunakan karakter spesifik (misal `' OR 1=1 --`) untuk mengelabui klausul RLS.
**Mitigasi**: 
1. Next.js menggunakan *Supabase SDK* yang berjalan di atas *PostgREST*. PostgREST menggunakan parameterisasi query secara ketat (prepared statements), menetralkan 100% *classic SQL Injection*.
2. Fungsi PL/pgSQL seperti `is_org_member` tidak melakukan *dynamic SQL* (EXECUTE string), melainkan parameter statis yang aman.

### T4. Cross-Tenant Storage Leak (Pencurian File/PDF)
**Deskripsi**: User A menebak URL file milik User B (misal ID KTP klien) dan mengunduhnya via browser.
**Mitigasi**: Bucket `vault` bersifat Private. Supabase memblokir akses HTTP *unauthorized*. Jika diakses lewat Client SDK, RLS Storage membaca elemen path pertama `(org_id)` dan memblokirnya. Akses ke dunia luar HANYA bisa melalui *Signed URLs* (dengan *expiry time*) yang digenerate oleh backend yang aman.

### T5. Privilege Escalation (Staff -> Owner)
**Deskripsi**: Seorang `STAFF` mengirim request API modifikasi tabel `organization_members` untuk menaikkan jabatannya menjadi `OWNER`.
**Mitigasi**: Tabel `organization_members` memiliki Policy UPDATE ketat:
```sql
CREATE POLICY "Only owners can update members" 
ON organization_members FOR UPDATE 
USING ( public.is_org_owner(org_id) );
```
Karena Staff gagal dalam `is_org_owner()`, *privilege escalation* digagalkan pada level database.

## 2. Arsitektur Audit Keamanan Terpusat
Untuk mendeteksi percobaan ancaman dan melacak perubahan tak terduga, NotaryGo SaaS mengandalkan **Database Triggers**.

Setiap operasi DML (`INSERT`, `UPDATE`, `DELETE`) pada tabel krusial seperti `matters` atau `invoices` memicu *trigger* yang:
1. Membaca `auth.uid()` (siapa pelakunya).
2. Merekam state data sebelumnya (`OLD`) dan sesudahnya (`NEW`) menjadi JSONB.
3. Menulis log secara otomatis ke `activity_logs`.
Trigger berjalan di dalam server DB (backend PostgreSQL) sehingga tidak mungkin di-bypass (dilompati) oleh penyerang sekalipun mereka berhasil menembus API aplikasi (Next.js).
