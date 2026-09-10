# PANDUAN INSTALASI NOTARYGO™
## Notary Office Operational Control System

Dokumen ini memandu Anda melakukan instalasi NOTARYGO™ dari awal sampai aplikasi siap digunakan oleh kantor Notaris & PPAT.

---

## 📋 Prasyarat (Prerequisites)

1. **Akun Google**: Akun Google Workspace Kantor (disarankan) atau akun Gmail Notaris/Owner.
2. **Akses Google Drive & Google Spreadsheet**: Untuk penyimpanan database dan berkas.
3. **Browser Modern**: Google Chrome, Mozilla Firefox, Microsoft Edge, atau Safari terbaru.

---

## 🛠️ Langkah-Langkah Instalasi (Step-by-Step)

### LANGKAH 1: Buat Proyek Google Apps Script Baru
1. Buka browser dan kunjungi [Google Apps Script](https://script.google.com).
2. Klik tombol **New Project** (Proyek Baru) di sudut kiri atas.
3. Beri nama proyek: `NOTARYGO — Notary Office Operational Control System`.

---

### LANGKAH 2: Konfigurasi Manifest (`appsscript.json`)
1. Di editor Apps Script, klik menu **Project Settings** (ikon roda gigi ⚙️ di panel kiri).
2. Centang opsi **Show "appsscript.json" manifest file in editor** (Tampilkan file manifes).
3. Kembali ke menu **Editor** (ikon `< >`).
4. Buka file `appsscript.json` dan ganti isinya dengan kode dari file [appsscript.json](file:///c:/Users/USER/Downloads/NotaryGo/appsscript.json).

---

### LANGKAH 3: Masukkan Seluruh File Kode Backend (.gs) & Frontend (.html)
Tambahkan file-file berikut ke dalam proyek Apps Script Anda (salin isi dari repository ini):

#### File Backend (Script File `.gs`):
* `Config.gs`
* `Utils.gs`
* `Database.gs`
* `Repository.gs`
* `Sequence.gs`
* `Migration.gs`
* `AuditService.gs`
* `Validation.gs`
* `Permissions.gs`
* `Auth.gs`
* `Security.gs`
* `OfficeService.gs`
* `UserService.gs`
* `ClientService.gs`
* `OrganizationService.gs`
* `WorkflowService.gs`
* `ChecklistService.gs`
* `NotificationService.gs`
* `AlertService.gs`
* `ReportService.gs`
* `DriveService.gs`
* `CalendarService.gs`
* `MailService.gs`
* `PdfService.gs`
* `BillingService.gs`
* `SigningService.gs`
* `CommunicationService.gs`
* `PendingService.gs`
* `TaskService.gs`
* `BackupService.gs`
* `MatterService.gs`
* `HealthService.gs`
* `Bootstrap.gs`
* `Code.gs`
* `Tests.gs`

#### File Frontend (HTML File `.html`):
* `Index.html`
* `Styles.html`
* `Components.html`
* `App.html`
* `Scripts.html`

> 💡 **Tips Cepat:** Anda juga dapat menggunakan alat bantu Google CLASP (`clasp push`) jika Anda terbiasa dengan command line.

---

### LANGKAH 4: Jalankan Inisialisasi Pertama Kali (`initializeNotaryGo`)
1. Di editor Apps Script, pilih fungsi `initializeNotaryGo` pada dropdown fungsi di bagian atas.
2. Klik tombol **Run** (Jalankan ▶).
3. Google akan meminta persetujuan izin akses (*Authorization Required*):
   * Klik **Review Permissions** (Tinjau Izin).
   * Pilih akun Google Notaris/Owner Anda.
   * Klik **Advanced** (Lanjutan) → **Go to NOTARYGO (unsafe)**.
   * Klik **Allow** (Izinkan).
4. Fungsi `initializeNotaryGo` akan otomatis:
   * Membuat Google Spreadsheet baru sebagai database operasional kantor.
   * Menginisialisasi 27 Sheet kanonikal dan seluruh kolom header secara otomatis.
   * Mengatur akun Google Anda sebagai **OWNER** utama.
   * Menginisialisasi 13 jenis layanan standar Notaris/PPAT dan 10 tahapan alur kerja (*Workflow*).
   * Membuat struktur folder Google Drive `NOTARYGO/`.
   * Mengatur pemicu otomatis (*Installable Triggers*) untuk notifikasi dan backup harian.

---

### LANGKAH 5: Verifikasi Kesehatan Sistem (`runHealthCheck`)
1. Pada dropdown fungsi editor, pilih `runHealthCheck`.
2. Klik **Run** (Jalankan ▶).
3. Buka tab **Execution Log** (Log Eksekusi) di bagian bawah.
4. Pastikan status menunjukkan:
   ```json
   {
     "status": "HEALTHY",
     "checks": [...]
   }
   ```

---

### LANGKAH 6: Jalankan Tes Otomatis (`runAllTests`)
1. Pada dropdown fungsi editor, pilih `runAllTests`.
2. Klik **Run** (Jalankan ▶).
3. Pastikan 14 suite tes lulus 100% (*14 Passed, 0 Failed*).

---

### LANGKAH 7: Deploy sebagai Web App (Publikasi)
1. Klik tombol biru **Deploy** (Terapkan) di sudut kanan atas → **New deployment** (Penerapan baru).
2. Klik ikon roda gigi ⚙️ di samping *Select type* → pilih **Web app**.
3. Isi konfigurasi deployment:
   * **Description**: `NOTARYGO Production Release v2.0`
   * **Execute as**: `User accessing the web app` (Akun yang mengakses aplikasi web) atau `Me` (Akun saya).
   * **Who has access**: `Anyone with Google account` (Siapa saja yang memiliki akun Google) atau pengguna dalam domain kantor Workspace Anda.
4. Klik **Deploy** (Terapkan).
5. Salin **Web App URL** yang dihasilkan. Ini adalah tautan resmi yang akan dibuka oleh Notaris, Staf, dan Kasir kantor Anda.

---

### LANGKAH 8: Onboarding Staf Kantor
1. Buka Web App URL di browser.
2. Masuk ke menu **Pengaturan & Profil** (Settings).
3. Perbarui informasi nama kantor, gelar Notaris, alamat, dan nomor rekening bank kantor.
4. Tambahkan staf kantor Anda melalui tombol **+ Tambah Staf** dengan memasukkan alamat email Google masing-masing dan menetapkan peran:
   * **ADMIN**: Staf administrasi & front office.
   * **SUPERVISOR**: Asisten Notaris / Senior Legal reviewer.
   * **STAFF**: Staf pelaksana berkas & lapangan/BPN.
   * **FINANCE**: Kasir / bendahara kantor.
5. Selesai! NOTARYGO™ siap digunakan untuk operasional harian kantor Notaris & PPAT Anda.
