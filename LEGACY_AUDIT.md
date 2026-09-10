# NOTARYGO™ LEGACY — ARCHITECTURE & CODE AUDIT

## 1. Ringkasan Eksekutif (Executive Summary)
Aplikasi NotaryGo saat ini adalah produk berbasis **Google Apps Script (GAS)** yang dijalankan sebagai *Web App* dengan **Google Sheets** sebagai basis data dan **Google Drive** sebagai media penyimpanan dokumen. Sistem ini dirancang untuk operasional Kantor Notaris/PPAT dan telah digunakan oleh 108 pembeli (lisensi *one-time*).

Sistem berjalan dengan arsitektur Monolitik di mana `Code.gs` bertindak sebagai Router/Controller utama (RPC endpoints via `google.script.run`), sedangkan antarmuka pengguna dibangun menggunakan HTML/CSS/JS klasik (`Index.html`, `App.html`, `Scripts.html`).

## 2. Arsitektur Infrastruktur (Legacy Stack)
- **Frontend**: HTML5, CSS murni (tanpa framework besar), Vanilla JavaScript. Antarmuka dirender menggunakan `HtmlService` dan dijalankan di dalam *Iframe Sandbox* Google.
- **Backend**: Google Apps Script (V8 Runtime) yang bertindak sebagai backend *serverless*.
- **Database**: Google Sheets (dimodelkan layaknya tabel relasional menggunakan `Repository.gs` dan `Database.gs`).
- **File Storage**: Google Drive API.
- **Authentication**: Email/Password sederhana yang disimpan di Sheets (di-hash menggunakan SHA-256 dan Salt) dipadukan dengan LocalStorage di sisi klien.

## 3. Temuan Kritis (Critical Findings)
### a. Limitasi Platform (GAS Limits)
Arsitektur GAS memiliki batasan ketat (kuota eksekusi 6 menit/skrip, batasan API call, batasan *concurrent users*) yang membuatnya **tidak cocok** untuk diubah langsung (lift-and-shift) menjadi produk *Software-as-a-Service (SaaS)* multi-tenant berskala besar.

### b. Database (Google Sheets)
Penggunaan `Database.withLock()` (LockService) pada setiap operasi tulis (`INSERT`, `UPDATE`, `DELETE`) memastikan integritas data (ACID), namun hal ini menyebabkan *bottleneck* performa yang parah jika sistem diakses oleh banyak pengguna secara bersamaan (Concurrency limit). Sheets bukanlah database relasional (SQL) yang sebenarnya, sehingga kueri kompleks (seperti JOIN) di-handle di memori (V8), yang sangat tidak efisien.

### c. Antarmuka (UI/UX)
Frontend `App.html` dan `Scripts.html` sudah terlalu gemuk (lebih dari 1500 baris kode per file), membuat proses pemeliharaan (maintenance) menjadi rumit. Penggunaan `google.script.run` juga membuat aplikasi terasa lambat (*high latency*) dibandingkan REST API atau GraphQL modern.

### d. Keamanan & Multi-Tenancy
Sistem saat ini didesain sebagai instalasi *single-tenant* (satu *spreadsheet* untuk satu kantor notaris). Untuk berubah menjadi SaaS, arsitektur basis data harus dirombak total untuk mendukung *Row-Level Security (RLS)* berbasis `tenant_id`.

## 4. Kesimpulan Audit
Sistem Legacy NotaryGo berfungsi baik sebagai MVP (*Minimum Viable Product*) untuk pasar *one-time purchase*. Namun, **arsitektur teknisnya sudah mencapai limitasi maksimalnya** dan tidak dapat di-*scale* untuk model berlangganan SaaS multi-tenant. Migrasi ke **Next.js & Supabase** (Phase 1) adalah keputusan strategis yang tepat. Alih-alih mentranslasi kode GAS, migrasi ini harus diperlakukan sebagai pembangunan ulang infrastruktur (*Re-platforming*), dengan mempertahankan dan mengkonversi *Business Logic* yang sudah teruji di GAS.
