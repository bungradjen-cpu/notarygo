# CHANGELOG — NOTARYGO™

Seluruh perubahan penting pada proyek NOTARYGO™ didokumentasikan dalam berkas ini. Format penulisan mengacu pada prinsip [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [2.1.0] — 2026-08-28 (Fitur Login & Super Admin Access Control)

### Added (Fitur Baru)
- **Dedicated Branded Login Screen**: Tampilan antarmuka login mandiri dengan Email & Password, background radial dark modern, backdrop blur glassmorphism, dan gold accent badges.
- **Salted SHA-256 Password Security**: `Utils.generateSalt()` dan `Utils.hashPassword(password, salt)` dengan integrasi `Utilities.computeDigest` (GAS) dan `crypto` (Node.js).
- **Credential Authentication Adapter**: `Auth.login(email, password)` dengan pencatatan audit log `USER_LOGIN` dan `FAILED_LOGIN_ATTEMPT`.
- **Super Admin Staff & Credential Management**:
  - Modal tambah staf dengan penetapan password awal pengguna.
  - Modal Super Admin Reset Password untuk mereset kata sandi staf kapan saja secara instan.
  - Tabel Daftar Staf & Akses Login di menu Pengaturan dengan indikator status, tanggal login terakhir, dan tombol reset password.
- **User Self-Service Password Change**: Fitur ganti password mandiri untuk pengguna yang sedang aktif melalui footer sidebar.
- **Automated Test Suite #15**: Pengujian komprehensif `Credential Login, Password Hashing & Super Admin Reset` di `Tests.gs` (15/15 suite lulus 100%).

---

## [2.0.0] — 2026-08-26 (Rilis Produksi Penuh)

### Added (Fitur Baru)
- **Manifest & Konfigurasi**: `appsscript.json` dengan runtime V8, zona waktu `Asia/Jakarta`, webapp manifest, dan cakupan OAuth scopes minimal.
- **Skema & Repositori 27 Sheet**: Database kanonikal terstruktur di `Config.gs`, `Database.gs`, dan `Repository.gs` dengan in-memory mock mode untuk isolasi pengujian.
- **Atomic Concurrency Sequences**: Generator nomor urut perkara (`NG-2026-000001`), invoice (`INV/NG/2026/00001`), kuitansi (`RCP/NG/2026/00001`), dan task (`TSK-2026-000001`) berbasis `LockService`.
- **Security & RBAC Layer**: Model hak akses berbasis peran (OWNER, ADMIN, SUPERVISOR, STAFF, FINANCE), pencegahan eskalasi hak akses, dan adapter otentikasi Google Workspace di `Auth.gs`, `Permissions.gs`, dan `Security.gs`.
- **Domain Services**:
  - `MatterService`: Register perkara lengkap dengan pembatalan (*Soft Cancel*), arsip, dan pemulihan (*Restore*).
  - `WorkflowService`: Mesin alur kerja 10 tahapan standar Notaris/PPAT dengan validasi transisi, pencatatan durasi di `WorkflowHistory`, dan *Owner Override*.
  - `TaskService`: Manajemen penugasan staf dan ruang kerja *My Work* terurut prioritas urgensi.
  - `PendingService`: Pelacakan alasan pending, aging counter (`pendingDays`), dan resolusi kembali ke aktif.
  - `ChecklistService`: Inisialisasi checklist dokumen per jenis layanan, penghitungan persentase kelengkapan berkas, dan generator pesan permohonan berkas klien.
  - `SigningService`: Penjadwalan signing terintegrasi Google Calendar dan mesin evaluasi *Signing Readiness*.
  - `BillingService`: Kalkulasi finansial otoritatif integer Rupiah backend, penerbitan invoice, pembayaran parsial/lunas, dan penerbitan kuitansi resmi.
  - `NotificationService`: Antrean pengiriman email notifikasi dengan deduplikasi harian dan pengiriman otomatis *Owner Daily Operational Brief* (07:30 WIB).
  - `AlertService`: Mesin deteksi exception operasional (CRITICAL, WARNING, WATCH).
  - `UserService`: Manajemen staf dan *Staff Handover Engine* otomatis.
  - `BackupService`: Snapshot backup database harian Google Spreadsheet.
  - `HealthService`: Diagnostik sistem komprehensif.
  - `PdfService`: Pratinjau dan rendering dokumen resmi (Invoice, Kuitansi LUNAS, Checklist, Lembar Tugas) siap cetak.
- **Frontend Modern & Elegan**:
  - `Index.html`: Shell SPA dengan navigasi sidebar, top navbar, modal dialogs, loading overlay, dan toast notifications.
  - `Styles.html`: Design system CSS modern (Deep Navy `#0f172a`, Slate `#1e293b`, Gold Accent `#d97706`, Emerald `#10b981`, Crimson `#ef4444`).
  - `Components.html`: Pustaka ikon SVG dan modul komponen.
  - `App.html`: 13 wadah tampilan halaman utama (Dashboard, My Work, Attention Required, Register Perkara, Detail Perkara, Klien & Intake, Mitra, Tugas & Pending, Signing, Tagihan, Laporan, Audit Log, Pengaturan).
  - `Scripts.html`: Client router, state management, dan wrapper RPC `google.script.run`.
- **Suite Pengujian Otomatis**: 14 suite unit & domain tests di `Tests.gs` dengan tingkat kelulusan 100%.
- **Dokumentasi Lengkap**: `README.md`, `INSTALLATION.md`, `DEPLOYMENT.md`, `USER_GUIDE.md`, `ARCHITECTURE.md`, `DATABASE_SCHEMA.md`, `TEST_REPORT.md`, `PRODUCTION_ACCEPTANCE.md`.
