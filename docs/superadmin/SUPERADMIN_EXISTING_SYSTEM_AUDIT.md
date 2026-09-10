# NOTARYGO™ Superadmin — Existing System Audit (Phase 0)

**Tanggal:** 2026-09-07  
**Auditor:** Antigravity SaaS Architecture Team  
**Konteks:** NOTARYGO™ Multi-Tenant SaaS & Single Platform Superadmin (`bungradjen@gmail.com`)

---

## 1. Ringkasan Audit Sistem

Audit menyeluruh dilakukan terhadap skema database (`saas-app/supabase/migrations/0001_identity_and_tenancy.sql` hingga `0011_platform_billing_transactions.sql`), kode sumber aplikasi (`saas-app/src`), routing Next.js 16, integrasi Mayar payment gateway, dan kebijakan Row Level Security (RLS).

Tujuan audit adalah memastikan implementasi Platform Superadmin dibangun secara **additive**, beroperasi langsung di atas skema yang ada, menjaga integritas RLS, tanpa trial, tanpa menghapus/mereset database produksi, dan memisahkan secara ketat domain keamanan platform dari operasional kantor notaris.

---

## 2. Tabel Klasifikasi Komponen

| Konsep Sistem | Lokasi Eksisting | Status / Keterangan | Klasifikasi | Rencana Aksi |
| :--- | :--- | :--- | :--- | :--- |
| **Auth Identity** | `auth.users` | Supabase Auth. User `bungradjen@gmail.com` telah terdaftar dengan ID `b90b18b6-d0d4-42d3-b90a-818a41aa987d`. | `KEEP` | Re-use akun eksisting. Jangan mengekspos password atau membuat akun admin kedua. |
| **Profiles** | `public.profiles` | Terhubung ke `auth.users(id)`. Menyimpan `email`, `full_name`, `phone`, `avatar_url`. | `KEEP` | Digunakan sebagai profil personil tenant & platform admin. |
| **Organizations (Tenant)** | `public.organizations` | Mewakili kantor Notaris/PPAT. Berisi nama kantor, notaris, slug, kontak. | `EXTEND` | Tambahkan kolom opsional `status` dan `onboarding_status` serta index untuk filtering performan. |
| **Organization Members** | `public.organization_members` | Menyimpan membership tenant: `OWNER`, `ADMIN`, `SUPERVISOR`, `STAFF`, `FINANCE`. | `KEEP` | **TIDAK BOLEH** menyimpan role `PLATFORM_SUPERADMIN` di tabel ini. |
| **Platform Admins** | `public.platform_admins` | Dibuat di `0008` sederhana: `(id, profile_id, created_at)`. | `EXTEND` | Tambahkan kolom `email`, `role`, `status`, `last_login_at` sesuai ERD Superadmin v1.0. |
| **Subscription Plans** | `public.subscription_plans` | Canonical plans di-seed di `0011`: Monthly (129k), Quarterly (249k), Annual (499k). | `KEEP` | Tetap menggunakan rencana harga kanonikal resmi tanpa modifikasi sepihak. |
| **Plan Entitlements** | `public.plan_entitlements` | Menyimpan kuota fitur per paket: storage, members, active matters. | `KEEP` | Dipertahankan dan diekspos sebagai read-only di `/superadmin/plans`. |
| **Subscriptions** | `public.subscriptions` | Menyimpan status langganan organisasi (`status`, `current_period_end`). | `KEEP` | Pertahankan integritas status. Jangan membuat status TRIALING baru. |
| **Billing Transactions** | `public.billing_transactions` | Dibuat di `0011` untuk transaksi Mayar dengan referensi `NGPAY-...`. | `EXTEND` | Tambahkan kolom `claim_status` (`UNCLAIMED` / `CLAIMED`) untuk melacak status registrasi pelanggan. |
| **Provider Webhooks** | `src/app/api/webhooks/mayar` | Webhook route memproses pembayaran Mayar secara langsung. | `EXTEND` | Tambahkan tabel `provider_webhook_events` untuk mencatat delivery webhook secara idempotent dan terlacak. |
| **Reconciliation Queue** | Belum ada | Belum ada deteksi sistematis ketidaksinkronan payment provider vs internal. | `MISSING` | Buat tabel `reconciliation_items` untuk queue rekonsiliasi satu klik. |
| **Renewal Operations** | Belum ada | Belum ada CRM tracking tindak lanjut renewal untuk kantor yang akan expired. | `MISSING` | Buat tabel `renewal_activities` untuk pipeline 7D/14D/30D renewal. |
| **Customer Health** | Belum ada | Belum ada kalkulasi kesehatan tenant (Healthy, Watch, At Risk). | `MISSING` | Implementasikan kalkulasi rule-based live berdasarkan masa aktif & frekuensi penggunaan. |
| **Customer Lifecycle** | Belum ada | Belum ada event tracking tahapan konversi customer lifecycle. | `MISSING` | Buat event logger transparan berbasis milestone nyata transaksi & kantor. |
| **Product Usage & Adoption** | `matters`, `tasks`, `documents`, `invoices` | Data tersimpan di tabel operasional masing-masing tenant. | `KEEP` | Lakukan agregasi efisien server-side tanpa membaca isi dokumen privat notaris. |
| **Support Tickets** | Belum ada | Belum ada modul bantuan tiket terstruktur. | `MISSING` | Buat tabel `support_tickets` untuk mencatat masalah login, billing, teknis, dll. |
| **Feedback & Feature Requests** | Belum ada | Belum ada modul agregasi masukan fitur dari notaris. | `MISSING` | Buat tabel `feedback_items` dan `feature_request_groups`. |
| **Storage Usage** | `document_versions` | Dokumen versi mencatat `file_size` fisik file storage. | `KEEP` | Agregasikan total storage per kantor untuk pemantauan kuota. |
| **Platform Audit Logs** | `public.platform_audit_logs` | Dibuat sederhana di `0008`. | `EXTEND` | Standardisasi ke `platform_admin_audit_logs` dengan before/after state dan target entitas. |
| **System Incidents & Errors** | Belum ada | Belum ada dashboard kesehatan teknis layanan. | `MISSING` | Buat tabel `system_incidents` dan monitor live ke Supabase, Mayar, Storage, Auth. |
| **Platform Settings** | Belum ada | Belum ada penyimpanan konfigurasi threshold operasional platform. | `MISSING` | Buat tabel `platform_settings` untuk ambang batas renewal & peringatan inaktivitas. |
| **Admin Route Shell** | `src/app/admin` | Terdapat mockup/prototype awal 3 kartu di `/admin`. | `REFACTOR` | Gantikan dengan dedicated Command Center di `/superadmin` dan redirect `/admin` &rarr; `/superadmin`. |

---

## 3. RLS & Model Keamanan
1. Seluruh tabel baru platform (`provider_webhook_events`, `reconciliation_items`, `renewal_activities`, `support_tickets`, `feedback_items`, `platform_admin_audit_logs`, `system_incidents`, `platform_settings`) dilindungi Row Level Security (RLS).
2. Hanya pengguna yang terverifikasi lewat fungsi `is_platform_admin()` yang memiliki izin SELECT/INSERT/UPDATE pada tabel platform.
3. Pengguna tenant reguler (OWNER, ADMIN, SUPERVISOR, STAFF, FINANCE) sama sekali tidak memiliki akses SELECT ke tabel-tabel platform.
4. Privasi tenant terjamin: Superadmin tidak pernah membuka isi fisik dokumen rahasia akta, password, maupun secret API key.

---

## 4. Kesimpulan Audit
Sistem NOTARYGO™ memiliki fondasi arsitektur multi-tenant dan sistem billing kanonikal yang kuat. Penambahan modul Superadmin dapat dilakukan 100% secara **additive** melalui migrasi `0012_superadmin_platform_schema.sql` tanpa mengganggu operasional tenant yang sedang berjalan.
