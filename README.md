# NOTARYGO™ — Notary Office Operational Control System

> **Tagline:** Kantor tetap terkontrol tanpa Owner harus mengawasi setiap detail.

NOTARYGO™ adalah sistem operasional terpadu untuk kantor Notaris & PPAT berbasis **Google Apps Script Web App** dan **Google Workspace**. Sistem ini dirancang sebagai *central operational system of record and operational control center* untuk mengendalikan perkara, workflow, deadline, checklist berkas, tugas staf, pending aging, jadwal penandatanganan akta (signing), keuangan, serta audit trail.

---

## 🌟 Fitur Utama (Core Capabilities)

### 1. Register Perkara & Nomor Otomatis (Matter Engine)
* Technical ID (`MAT_...`) terpisah dari nomor perkara human-readable (`NG-2026-000001` atau format kustom seperti `AJB/2026/0001`).
* Penomoran concurrency-safe menggunakan `LockService`.
* State machine status lengkap: `DRAFT`, `ACTIVE`, `PENDING`, `WAITING_APPROVAL`, `COMPLETED`, `CANCELLED`, `ARCHIVED`.
* Pembatalan perkara (*Soft Cancel*): tidak menghapus database, tetap mempertahankan berkas, invoice, dan riwayat audit.
* Pemulihan perkara (*Restore*): Owner dapat memulihkan perkara yang dibatalkan/diarsipkan.

### 2. Workflow Pipeline & SOP Berbasis Konteks
* 10 Tahapan standar Notaris & PPAT: `INCOMING` → `DOCUMENT_CHECKING` → `WAITING_DOCUMENT` → `DRAFTING` → `INTERNAL_REVIEW` → `NOTARY_APPROVAL` → `CLIENT_APPROVAL` → `SIGNING` → `PROCESSING` → `COMPLETED`.
* Validasi transisi tahapan mencegah loncat status tidak sah.
* *Owner Override* dengan pencatatan alasan wajib dan audit log.
* Riwayat `WorkflowHistory` mencatat durasi per tahap untuk analisis aging dan bottleneck.

### 3. Exception & Attention Required Engine
* Deteksi otomatis masalah operasional berkategori:
  * **CRITICAL**: Perkara overdue, perkara aktif tanpa PIC, jadwal signing hari ini/besok yang belum siap (*NOT_READY*), tugas kritis terlambat.
  * **WARNING**: Deadline $\le 3$ hari, pending $> 7$ hari, tidak ada aktivitas operasional $> 5$ hari, invoice jatuh tempo.
  * **WATCH**: Deadline $\le 7$ hari, pending $> 3$ hari.

### 4. My Work — Ruang Kerja Harian Staf
* Menampilkan tugas terurut berdasarkan urgensi: Terlambat (*Overdue*) → Kritis (*Critical*) → Deadline Hari Ini → Tugas lainnya.
* Akses cepat ke perkara aktif, jadwal follow-up, dan jadwal signing staf.
* Tombol aksi cepat penyelesaian tugas (*Quick Complete*).

### 5. Kontrol Pending & Penuaan (*Pending Aging*)
* Kategori alasan pending terstruktur: `CLIENT`, `BANK`, `DEVELOPER`, `BPN`, `TAX`, `APPROVAL`, `DOCUMENT`, `SIGNATURE`, `INTERNAL`, `OTHER`.
* Perhitungan otomatis lama pending (`pendingDays`) dan distribusi aging.

### 6. Checklist Dokumen & Persentase Kelengkapan
* Template persyaratan berkas otomatis sesuai jenis layanan (AJB, PPJB, APHT, Roya, Pendirian PT, dll.).
* Status berkas: `MISSING`, `RECEIVED`, `NEED_REVISION`, `VERIFIED`, `NOT_APPLICABLE`.
* Perhitungan persentase kelengkapan berkas wajib yang terverifikasi.
* Generator permohonan kelengkapan berkas otomatis untuk klien (WhatsApp / Pesan).

### 7. Penandatanganan Akta & Signing Readiness
* Penjadwalan signing terintegrasi dengan Google Calendar (mencegah duplicate event via `googleCalendarEventId`).
* *Readiness Evaluation*: Evaluasi otomatis kelengkapan berkas dan persetujuan draft akta sebelum penandatanganan dilakukan.

### 8. Keuangan, Tagihan & Kuitansi (Billing & Invoicing)
* Perhitungan finansial otoritatif di backend (*integer currency* Rupiah).
* Nomor invoice dan kuitansi otomatis (`INV/NG/2026/00001`, `RCP/NG/2026/00001`).
* Pencatatan pembayaran parsial / lunas dengan proteksi overpayment.
* Status otomatis `PAID` ketika sisa tagihan (*outstanding*) = 0.
* Pratinjau dan cetak Kuitansi resmi dengan watermark "LUNAS".

### 9. Antrean Notifikasi Gmail & Deduplikasi
* Arsitektur antrean (*Notification Queue*) mencegah kuota email terlampaui.
* Deduplikasi email mencegah pengiriman email berulang untuk event yang sama.
* *Owner Daily Operational Brief* terjadwal setiap pukul 07:30 WIB.

### 10. Audit Trail & Diagnostik Sistem
* `ActivityLogs` bersifat *append-only* (mencatat aktor, timestamp, sebelum/sesudah, dan `requestId`).
* Diagnostik kesehatan sistem (`runHealthCheck()`) untuk memastikan integritas database, skema 27 sheet, Drive, dan pemicu waktu (*triggers*).
* Backup harian otomatis snapshot Google Spreadsheet.

---

## 📁 Struktur Berkas Proyek

```text
appsscript.json            # Manifest GAS (V8, Asia/Jakarta, Scopes)
Code.gs                    # Main HTTP Controller (doGet) & Public RPC API
Config.gs                  # Konstanta, Enums & Skema 27 Sheet
Bootstrap.gs               # Inisialisasi Idempotent, Triggers & Demo Seeder
Auth.gs                    # Adapter Google Identity & Sesi Pengguna
Permissions.gs             # Matriks RBAC (OWNER, ADMIN, SUPERVISOR, STAFF, FINANCE)
Security.gs                # Guard Otorisasi & Pencegahan Eskalasi Hak Akses
Validation.gs              # Validasi Input Data Server-Side
Database.gs                # Abstraksi Google Sheets & Mock Database Store
Repository.gs              # Typed Domain Repositories
Sequence.gs                # Generator Nomor Urut Concurrency-Safe (LockService)
Migration.gs               # Version Tracker & Engine Migrasi Database
OfficeService.gs           # Profil Kantor & Branding
UserService.gs             # Pengelolaan Pengguna & Staff Handover
ClientService.gs           # Manajemen Klien & Funnel Pre-Matter Intake
OrganizationService.gs     # Manajemen Mitra (Bank, Developer, dsb.)
MatterService.gs           # Register Perkara, Cancel, Archive & Restore
WorkflowService.gs         # Workflow Engine, Validasi Transisi & History
TaskService.gs             # Penugasan Tugas & My Work
PendingService.gs          # Manajemen Alasan & Aging Pending
FollowUpService.gs         # Penjadwalan Follow-up Komunikasi
ChecklistService.gs        # Checklist Berkas & Perhitungan Kelengkapan
DocumentService.gs         # Document Center & Version Control
ApprovalService.gs         # Review & Approval Multi-Stage
SigningService.gs          # Jadwal Signing & Evaluasi Signing Readiness
CommunicationService.gs    # Log Komunikasi Resmi
BillingService.gs          # Invoice, Pembayaran & Kuitansi
NotificationService.gs     # Antrean Notifikasi & Owner Daily Brief
AlertService.gs            # Mesin Pengecualian (Attention Required)
ReportService.gs           # Laporan Operasional, Aging & Workload
BackupService.gs           # Snapshot Backup Database Spreadsheet
DriveService.gs            # Pengorganisasian Folder Google Drive
CalendarService.gs         # Integrasi Google Calendar
MailService.gs             # Pengiriman Email & Template HTML
PdfService.gs              # Generator Dokumen & Ekspor PDF
AuditService.gs            # Append-Only Audit Logging
HealthService.gs           # Diagnostik Sistem (Health Check)
Utils.gs                   # Helper Format Rupiah, Tanggal & ID
Tests.gs                   # Suite Tes Otomatis (runAllTests)

Index.html                 # Shell Aplikasi Web & Modal Dialogs
Styles.html                # Design System CSS (Navy/Slate/Gold Theme)
Components.html            # Pustaka Ikon SVG & Komponen
App.html                   # Kontainer Halaman View Aplikasi
Scripts.html               # Router Client-Side & Pengelola RPC
```

---

## 🚀 Memulai (Quick Start)

1. Buka [INSTALLATION.md](file:///c:/Users/USER/Downloads/NotaryGo/INSTALLATION.md) untuk panduan instalasi langkah demi langkah.
2. Buka [USER_GUIDE.md](file:///c:/Users/USER/Downloads/NotaryGo/USER_GUIDE.md) untuk panduan operasional pengguna.
3. Buka [TEST_REPORT.md](file:///c:/Users/USER/Downloads/NotaryGo/TEST_REPORT.md) untuk melihat hasil pengujian otomatis.
