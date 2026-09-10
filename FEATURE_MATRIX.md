# FEATURE CLASSIFICATION MATRIX

| No | Feature / Domain | Description / Legacy Implementation | Status / Classification | Action untuk SaaS |
|---|---|---|---|---|
| 1 | **Semua Fitur Utama** | Keseluruhan sistem operasi kantor Notaris | `WORKING` | `MUST REBUILD` (Next.js/Supabase) |
| 2 | **Semua Halaman (Pages)** | Dashboard, Clients, Matters, Invoices, Settings (SPA via Hide/Show Divs) | `WORKING` | `MUST REBUILD` (Ubah menjadi rute dinamis Next.js App Router) |
| 3 | **Semua Role** | Super Admin, Admin, Notaris, Staf (Hardcoded roles) | `WORKING` | `REUSABLE BUSINESS LOGIC` (Migrasi ke skema RBAC di Postgres) |
| 4 | **Semua Database/Sheet** | 16 Tabs Sheet sebagai tabel Database | `WORKING` | `MUST REBUILD` (Migrasi skema ke PostgreSQL) |
| 5 | **Entity dan Field** | ID Generator (`ACT-001`, `INV-001`), struktur field | `WORKING` | `REUSABLE BUSINESS LOGIC` (Gunakan UUID di Postgres + display sequence) |
| 6 | **Authentication** | Custom Auth Hash (SHA256) dengan LocalStorage | `WORKING` | `MUST REBUILD` (Ganti dengan Supabase Auth - JWT) |
| 7 | **Matter/File Register** | Pendaftaran Perkara, Tracker, Timeline (`MatterService`) | `WORKING` | `REUSABLE BUSINESS LOGIC` |
| 8 | **Workflow** | Template Workflow yang di-hardcode/berbasis sheet | `PARTIALLY WORKING` | `REUSABLE BUSINESS LOGIC` (Konversi ke JSONB di Postgres) |
| 9 | **Task (Penugasan)** | Penugasan (PIC, Deadline) | `WORKING` | `REUSABLE BUSINESS LOGIC` |
| 10 | **Pending (Kekurangan)** | Menandai pending requirement pada perkara | `WORKING` | `REUSABLE BUSINESS LOGIC` |
| 11 | **Follow-Up (Tindak Lanjut)** | Pencatatan log interaksi | `WORKING` | `REUSABLE BUSINESS LOGIC` |
| 12 | **Client & Organization** | CRM dasar untuk individu dan PT/Bank | `WORKING` | `REUSABLE BUSINESS LOGIC` |
| 13 | **Document Center** | Integrasi GDrive, pencatatan berkas | `WORKING` | `MUST REBUILD` (Ganti GDrive dengan Supabase Storage) |
| 14 | **PDF Generation** | HTML ke PDF Blob via Google Utilities | `PARTIALLY WORKING` (Terhalang Iframe Sandbox) | `MUST REBUILD` (Gunakan Puppeteer, React-pdf, atau SaaS API lain) |
| 15 | **Invoice** | Tagihan, Subtotal, Pajak | `WORKING` | `REUSABLE BUSINESS LOGIC` |
| 16 | **Payment (Pembayaran)** | Pencatatan termin cicilan dan lunas | `WORKING` | `REUSABLE BUSINESS LOGIC` |
| 17 | **Receipt (Kwitansi)** | Cetak kwitansi | `PARTIALLY WORKING` | `MUST REBUILD` |
| 18 | **Gmail / Notification** | Mengirim email notifikasi via `MailApp` | `WORKING` | `MUST REBUILD` (Ganti dengan Resend / SendGrid API) |
| 19 | **Calendar** | Sinkronisasi ke Google Calendar Notaris | `WORKING` | `LEGACY ONLY` (Di SaaS, butuh OAuth 2.0 per tenant untuk akses GCal) |
| 20 | **Reporting** | Rekap bulanan, pendapatan | `WORKING` | `REUSABLE BUSINESS LOGIC` (Query via Postgres Views lebih superior) |
| 21 | **Settings** | Konfigurasi Profil Kantor & Layanan | `WORKING` | `REUSABLE BUSINESS LOGIC` (Tingkatkan ke Tenant Settings) |
| 22 | **Audit Log** | Log aktivitas user | `WORKING` | `REUSABLE BUSINESS LOGIC` (Cocok menggunakan Supabase Webhooks/Triggers) |
| 23 | **Backup** | Dump database ke Google Drive | `WORKING` | `LEGACY ONLY` (Supabase menggunakan PITR - Point In Time Recovery) |
| 24 | **Automation / Triggers** | `Time-driven triggers` untuk notifikasi harian | `WORKING` | `MUST REBUILD` (Gunakan Supabase Edge Functions / Cron (pg_cron)) |

**Keterangan:**
* `LEGACY ONLY`: Fitur/Konsep ini lahir karena batasan/keunikan ekosistem Google dan mungkin tidak lagi relevan atau harus dirombak total pendekatannya di ranah SaaS standar.
* `REUSABLE BUSINESS LOGIC`: Logika alur kerjanya sudah matang, aturan (rules) nya harus dibawa dan disalin ke framework SaaS, meski sintaks kodenya berubah.
* `MUST REBUILD`: Implementasinya terikat kuat dengan Apps Script/Google APIs dan harus dibangun ulang menggunakan teknologi modern (Node.js/React).
