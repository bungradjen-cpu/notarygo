# SAAS MIGRATION GAPS & RECOMMENDATIONS

Dokumen ini membedah jurang perbedaan (*Gaps*) antara NotaryGo Legacy (Google Ecosystem) dengan NotaryGo SaaS (Next.js & Supabase) yang akan datang (Phase 1).

## 1. Architecture Gaps (Perbedaan Fundamental)

| Komponen | NotaryGo Legacy (GAS) | NotaryGo SaaS (Next.js + Supabase) | Gap & Solusi |
|---|---|---|---|
| **Pola Kepemilikan Data** | Single-Tenant (1 Akun Google = 1 Sistem/Database terpisah) | Multi-Tenant (Semua pengguna berbagi 1 sistem/database besar) | **GAP BESAR**. Aplikasi SaaS harus mengimplementasikan **Row-Level Security (RLS)**. Setiap baris di database harus memiliki `tenant_id` untuk mencegah kebocoran data antar kantor notaris. |
| **Authentication** | Custom Hash (SHA-256) di Google Sheets + LocalStorage | Supabase Auth (JWT, Magic Links, OAuth) | **SOLUSI**: Hentikan metode *custom hash*. Transisikan penuh ke Supabase Auth untuk keamanan kelas enterprise. Tidak ada migrasi password dari versi lama (harus reset password). |
| **File Storage** | Google Drive API (File disimpan di Drive milik Notaris/Pemilik) | Supabase Storage (S3-compatible) | **GAP**: File di SaaS akan memakan *bandwidth/storage cost* pemilik SaaS. **SOLUSI**: Terapkan limit/kuota penyimpanan (Storage Quota) per tenant berdasarkan tier langganan. |
| **Dokumen / PDF** | `HtmlService` ke PDF Blob (Terbatas oleh sandbox & timeout) | Server-side PDF Generation (Node.js) | **SOLUSI**: Gunakan library modern seperti `puppeteer`, `react-pdf`, atau `jsreport` di dalam API endpoint (Next.js App Router). |
| **Email & Notifikasi** | `MailApp` & `GmailApp` (Quota 100-1500 email/hari, via akun personal pengguna) | Provider Eksternal Terpusat (Resend, SendGrid, AWS SES) | **GAP**: Email tidak lagi dikirim "dari" akun pengguna (kecuali diatur SMTP khusus), melainkan dari sistem SaaS. |
| **Pekerjaan Latar Belakang** | Google *Time-driven Triggers* | Supabase Edge Functions / `pg_cron` | **SOLUSI**: Konversi fungsi-fungsi cron (seperti peringatan deadline besok) ke `pg_cron` atau *cron job* eksternal yang memanggil *Edge Function*. |

---

## 2. Final Recommendations untuk Phase 1 (SaaS Next.js)

Berdasarkan audit komprehensif, berikut adalah rekomendasi arsitektural terkait apa yang harus dipertahankan, dibangun ulang, atau dibuang pada Fase 1:

### 🔴 DROP (Dibuang / Tidak Dilanjutkan)
1. **Google Sheets Database (`Database.gs`, `Repository.gs`)**: Dibuang secara total.
2. **LockService (`Database.withLock()`)**: Dibuang. Transaksi asinkron (ACID) akan sepenuhnya dipercayakan pada kapabilitas transaksi relasional PostgreSQL (`BEGIN`, `COMMIT`, `ROLLBACK`).
3. **Google Apps Script UI (`HtmlService`)**: Semua file `.html` (termasuk `App.html`, `Scripts.html`, `Styles.html`) dibuang, digantikan oleh komponen-komponen React di Next.js (Tailwind CSS, Shadcn UI).
4. **Local Password Hashing (`Auth.gs`)**: Dibuang demi keamanan standar industri dari Supabase.
5. **Google Drive Integration Terbuka**: Dibuang (atau ditunda ke roadmap masa depan), gantikan dengan Supabase Storage untuk kemudahan akses dan manajemen file antar *device*.

### 🔵 KEEP (Dipertahankan, secara Konseptual)
1. **Model Data dan Field (Schema)**: 90% struktur kolom (*fields*) pada tab Sheets saat ini valid untuk di-*mapping* 1:1 menjadi kolom PostgreSQL.
2. **Aturan Bisnis (Business Logic)**: Aturan validasi (tidak bisa menghapus klien yang memiliki perkara, kalkulasi tagihan, dsb) valid dan harus disalin ulang (Porting) ke Node.js.
3. **Penamaan Terminologi (Domain Language)**: Istilah *Matter*, *Intake*, *Client*, *PIC*, dll tetap digunakan karena sudah sesuai dengan standar industri (*Notary Operations*).

### 🟢 REBUILD & MIGRATE (Dibangun Ulang & Dimigrasikan)
1. **UI/UX Baru**: Frontend *Single Page Application (SPA)* klasik dibangun ulang menggunakan **Next.js App Router** untuk mencapai SEO (Marketing site) dan performa tinggi (Dashboard).
2. **Multi-Tenant Database**: Membangun schema PostgreSQL di **Supabase** menggunakan pola RLS (Row Level Security).
3. **API Layer**: Mengganti `google.script.run` (RPC) menjadi rute API RESTful (Next.js Route Handlers) atau menggunakan Supabase Client/Server Components secara langsung.
4. **Sistem PDF**: Mengganti mekanisme cetak PDF menjadi server-side HTML-to-PDF engine murni agar layout lebih tajam, bisa dikostumisasi, dan mendukung kop surat dinamis.

***
**Kesimpulan Phase 0 Selesai.** Audit rampung. Arsitektur Legacy telah dipetakan, batasannya dipahami, dan strategi migrasi ke SaaS telah diformulasikan. Kode sumber Legacy (GAS) dipastikan tetap utuh (tidak disentuh/dimodifikasi).
