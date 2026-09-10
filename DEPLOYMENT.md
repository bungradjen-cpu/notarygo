# PANDUAN DEPLOYMENT & RELEASE MANAGEMENT — NOTARYGO™

Dokumen ini menjelaskan arsitektur deployment, konfigurasi lingkungan (*Environments*), siklus rilis, manajemen izin OAuth, dan pemicu terjadwal (*Triggers*) untuk NOTARYGO™.

---

## 🏢 Profil Deployment

### 1. Profile A: Google Workspace Domain Kantor (Rekomendasi Utama)
* **Skenario**: Seluruh staf menggunakan akun email domain kantor resmi (misal: `@kantornotaris.com`).
* **Execute as**: `User accessing the web app`
* **Who has access**: `Anyone within kantornotaris.com`
* **Kelebihan**:
  * Identitas Google staf otomatis terdeteksi via `Session.getActiveUser().getEmail()`.
  * Keamanan domain tertutup (orang luar tidak dapat membuka aplikasi).
  * Dokumen Drive tersimpan di shared drive / domain kantor.

### 2. Profile B: Mixed Gmail / Akun Google Eksternal
* **Skenario**: Kantor menggunakan akun `@gmail.com` pribadi atau kombinasi berbagai domain.
* **Execute as**: `User accessing the web app` atau `Me` (dengan adapter otentikasi)
* **Who has access**: `Anyone with Google account`
* **Kelebihan**: Fleksibel untuk kantor yang belum memiliki domain Google Workspace berbayar.
* **Keamanan**: Dikendalikan oleh tabel `Users` di database NOTARYGO™. Pengguna yang emailnya tidak terdaftar atau berstatus `INACTIVE` langsung diblokir di level backend.

---

## 🔐 OAuth Scopes & Prinsip Hak Akses Minimal (*Least Privilege*)

Aplikasi menggunakan cakupan izin Google yang didefinisikan dalam `appsscript.json`:

| Scope | Fungsi Penggunaan |
|---|---|
| `https://www.googleapis.com/auth/spreadsheets` | Membaca & menulis ke Google Spreadsheet database |
| `https://www.googleapis.com/auth/drive` | Mengelola folder berkas perkara & snapshot backup |
| `https://www.googleapis.com/auth/documents` | Pembuatan dokumen resmi dari template Google Docs |
| `https://www.googleapis.com/auth/gmail.send` | Pengiriman antrean notifikasi & Daily Brief |
| `https://www.googleapis.com/auth/calendar` | Sinkronisasi jadwal penandatanganan akta |
| `https://www.googleapis.com/auth/userinfo.email` | Identifikasi email akun Google pengguna saat login |

---

## ⏰ Pemicu Waktu Terjadwal (*Installable Triggers*)

NOTARYGO™ menggunakan 3 pemicu waktu otomatis yang diatur secara idempotent oleh `Bootstrap.setupTriggers()`:

```text
+------------------------------------+------------------+-----------------------------+
| Nama Fungsi Trigger                | Frekuensi        | Deskripsi                   |
+------------------------------------+------------------+-----------------------------+
| processNotificationQueueTrigger    | Setiap 15 Menit  | Memproses antrean email     |
| sendDailyBriefTrigger              | 07:30 WIB Harian | Mengirim Daily Brief Owner  |
| runDailyBackupTrigger              | 23:00 WIB Harian | Snapshot backup database    |
+------------------------------------+------------------+-----------------------------+
```

---

## 🔄 Prosedur Rilis Pembaruan Kode (Update Release)

Jika ada pembaruan file di repository:
1. Perbarui file `.gs` atau `.html` pada editor Apps Script.
2. Klik tombol **Deploy** → **Manage deployments** (Kelola penerapan).
3. Klik ikon pensil ✏️ untuk mengedit deployment aktif.
4. Pilih **Version**: `New version` (Versi baru).
5. Berikan deskripsi versi (contoh: `Release v2.0.1 - Bug fixes & UI update`).
6. Klik **Deploy**. URL Web App tetap sama sehingga seluruh staf tidak perlu mengganti tautan.
