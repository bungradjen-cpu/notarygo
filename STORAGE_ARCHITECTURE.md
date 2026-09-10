# STORAGE ARCHITECTURE & FILE ISOLATION

NotaryGo SaaS memigrasikan penyimpanan dari Google Drive menjadi **Supabase Storage (S3-compatible)**. Arsitektur ini menjamin dokumen sepenuhnya berada di bawah kendali platform SaaS, dapat diamankan menggunakan RLS, dan terstruktur berdasarkan entitas *Matter*.

## 1. Bucket Configuration

Hanya ada satu Storage Bucket utama untuk operasional:
- **Bucket Name**: `vault`
- **Visibility**: PRIVATE (Tidak dapat diakses publik tanpa JWT yang memiliki autorisasi, atau via Signed URL sementara).

## 2. Folder Structure Taxonomy

Struktur *path* di dalam bucket dirancang sangat ketat untuk mempermudah audit dan menegakkan isolasi tenant:

```text
vault/
└── {org_id}/
    ├── profile/
    │   └── avatar.png
    ├── clients/
    │   └── {client_id}/
    │       └── identitas.pdf
    └── matters/
        └── {matter_id}/
            ├── requirements/
            │   └── ktp_suami_istri.pdf
            ├── drafts/
            │   ├── akta_v1.docx
            │   └── akta_v2.docx
            └── final/
                └── salinan_signed.pdf
```

Setiap file di dalam Supabase Storage wajib diawali dengan `org_id` di root path-nya.

## 3. Storage Row-Level Security (RLS)

Sama seperti tabel database, Supabase Storage memetakan *bucket* dan *object* ke dalam skema `storage.objects`. RLS ditegakkan dengan mengekstrak `{org_id}` dari path file (menggunakan fungsi string array).

```sql
-- POLICY: User hanya bisa melihat, mengunggah, dan mengunduh file milik organisasinya
CREATE POLICY "Tenant isolation for Storage Vault"
ON storage.objects FOR SELECT, INSERT, UPDATE, DELETE
USING (
    bucket_id = 'vault' 
    AND 
    public.is_org_member( (storage.foldername(name))[1]::uuid )
);
```

**Penjelasan:**
`(storage.foldername(name))[1]` akan mengambil elemen pertama dari path (yaitu folder paling luar). Karena struktur kita adalah `vault/{org_id}/...`, elemen pertama selalu berupa `org_id`. RLS kemudian memanggil `public.is_org_member(org_id)`. Ini secara ajaib mengamankan SEMUA file di seluruh tenant.

## 4. Document Versioning Strategy
- File tidak pernah di-*overwrite* (replace).
- Setiap *update* dokumen di *Document Center* akan menghasilkan baris baru di tabel PostgreSQL `document_versions` dan file fisik baru di *Storage*.
- *Nomenclature* File: `{timestamp}_{uuid}_{filename.ext}` untuk menjamin nama file unik dan tidak bertabrakan.
- URL Publik (Share link untuk klien) dihasilkan menggunakan `Supabase.storage.from('vault').createSignedUrl(path, expiresIn)`. Link kedaluwarsa secara default dalam 24 jam.
