# PANDUAN PENGGUNA (USER GUIDE) — NOTARYGO™
## Notary Office Operational Control System

---

## 🎯 Panduan Berdasarkan Peran (Role-Based Guide)

### 1. NOTARIS / OWNER
Sebagai pimpinan dan penanggung jawab kantor, fokus Anda adalah kendali mutu, pemantauan deadline, dan penyelesaian hambatan (*bottlenecks*):
* **Dashboard Control Center**: Pantau 7 kartu KPI utama (Perkara Aktif, Terlambat, Pending, Deadline Hari Ini, Signing Hari Ini, Tanpa PIC, Outstanding Tagihan).
* **Attention Required**: Periksa alert kritis setiap pagi. Klik tombol **Buka Perkara** untuk langsung menginstruksikan staf atau mengambil tindakan.
* **Owner Daily Brief**: Terima ringkasan email otomatis setiap pukul 07:30 WIB berisi rincian perkara berisiko dan jadwal signing hari ini.
* **Owner Override**: Notaris memiliki wewenang untuk melakukan bypass tahapan alur kerja dengan mencantumkan alasan resmi untuk kebutuhan mendesak / dispensasi klien.
* **Staff Handover Wizard**: Jika ada staf yang cuti atau resign, gunakan wizard handover di menu **Pengaturan** untuk memindahkan seluruh perkara, tugas, dan jadwal signing ke staf baru dalam 1 kali klik.

---

### 2. STAF OPERASIONAL / PELAKSANA (STAFF)
* **My Work Workspace**: Buka menu *My Work* setiap pagi sebagai daftar kerja harian Anda.
* **Mengerjakan Tugas**: Klik tombol **✓ Selesai** ketika suatu tugas lapangan/kantor selesai dikerjakan.
* **Memeriksa Checklist Berkas**:
  1. Buka perkara terkait.
  2. Pada tabel checklist, klik tombol **Verifikasi** pada dokumen yang diserahkan klien.
  3. Ubah status menjadi `VERIFIED` atau `NEED_REVISION` beserta catatannya.
* **Membuat Permohonan Dokumen**: Klik tombol **Permohonan Dokumen** pada detail perkara untuk menghasilkan format teks permintaan berkas yang siap disalin ke WhatsApp klien.

---

### 3. ASISTEN NOTARIS / LEGAL REVIEWER (SUPERVISOR)
* **Pemeriksaan Draft Akta**: Masuk ke detail perkara dan tinjau berkas yang ada di *Document Center*.
* **Transisi Alur Kerja**: Klik tombol **Update / Lanjut Tahapan** setelah pemeriksaan selesai untuk memajukan tahapan (misal: dari `DRAFTING` ke `NOTARY_APPROVAL`).
* **Evaluasi Signing**: Pastikan indikator *Signing Readiness* berstatus `READY` (seluruh berkas wajib terverifikasi dan draft telah disetujui) sebelum menjadwalkan penandatanganan akta dengan para pihak.

---

### 4. ADMINISTRASI & FRONT OFFICE (ADMIN)
* **Pencatatan Klien Baru**: Masuk ke menu **Klien & Prospek** → klik **+ Klien Baru**.
* **Pencatatan Prospek Intake**: Catat calon klien yang berkonsultasi di tab *Funnel Intake*.
* **Konversi Intake ke Perkara**: Ketika calon klien sepakat untuk memproses akta, klik tombol **Konversi ke Perkara →**. Sistem akan otomatis membuat data klien dan perkara baru secara terintegrasi.
* **Membuat Perkara Baru Langsung**: Klik tombol emas **+ Tambah Perkara Baru** pada Register Perkara.

---

### 5. KEUANGAN & KASIR (FINANCE)
* **Menerbitkan Invoice**:
  1. Buka perkara terkait pada menu *Register Perkara* atau *Tagihan & Kuitansi*.
  2. Klik **+ Tagihan** (Invoice).
  3. Masukkan rincian komponen biaya (Jasa Akta, Validasi Pajak, PNBP BPN, dll.), potongan jika ada, dan tanggal jatuh tempo.
* **Mencatat Pembayaran Klien**:
  1. Pada daftar tagihan, klik tombol **Bayar**.
  2. Masukkan nominal uang yang diterima (sistem mendukung pembayaran bertahap/parsial maupun lunas).
  3. Pilih metode pembayaran (Transfer Bank, Tunai, Giro, QRIS) dan nomor referensi.
  4. Sistem otomatis menerbitkan **Kuitansi Resmi** dengan nomor unik (`RCP/NG/...`).
* **Mencetak Dokumen**: Klik tombol **PDF** pada invoice atau kuitansi untuk menampilkan pratinjau dan mencetak dokumen resmi ber-kop kantor.

---

---

## 🔐 Panduan Login & Hak Akses Pengguna (Super Admin)

### 1. Masuk ke Sistem (Login)
1. Buka URL Web App NOTARYGO™.
2. Masukkan **Email Akun** dan **Kata Sandi (Password)** Anda.
3. Klik tombol **Masuk ke NOTARYGO™ →**.
4. Setelah kredensial terverifikasi, Anda akan langsung diarahkan ke Dashboard Operasional sesuai dengan hak akses (Role) Anda.
> **Default Akun Super Admin Pertama**:  
> - **Email**: `notaris.utama@kantornotaris.com` (atau email akun Google Notaris Anda)  
> - **Password Default**: `NotaryGo123!`

---

### 2. Super Admin: Menambah Akun Staf & Membuat Password Awal
Hanya **Super Admin / Owner (Notaris)** yang dapat menambahkan akun staf baru ke dalam sistem:
1. Masuk ke menu **Pengaturan & Profil**.
2. Gulir ke bagian **Daftar Staf Kantor & Akses Login**.
3. Klik tombol **+ Tambah Staf & Buat Password**.
4. Isi data staf:
   - **Email Akun**: Email staf yang digunakan untuk login.
   - **Nama Lengkap & Gelar**: Nama staf (contoh: *Ahmad Fauzi, S.H.*).
   - **Peran / Role**: Pilih hak akses (`STAFF`, `SUPERVISOR`, `ADMIN`, `FINANCE`, `OWNER`).
   - **No. HP / WA**: Nomor kontak WhatsApp staf.
   - **Password Awal**: Masukkan password awal (default: `NotaryGo123!`).
5. Klik **Simpan Pengguna & Password**. Akun staf langsung aktif dan dapat langsung digunakan untuk login.

---

### 3. Super Admin: Mereset Password Staf Kantor
Jika ada staf yang lupa password atau memerlukan pergantian kredensial secara darurat:
1. Buka menu **Pengaturan & Profil**.
2. Pada tabel **Daftar Staf Kantor & Akses Login**, temukan nama staf yang bersangkutan.
3. Klik tombol **🔑 Reset Password**.
4. Masukkan password baru untuk staf tersebut.
5. Klik **Simpan Password Baru**. Password baru akan langsung aktif saat itu juga dan seluruh aktivitas dicatat pada Audit Trail.

---

### 4. Pengguna: Mengganti Password Sendiri (Self-Service)
Setiap pengguna dapat mengubah password akunnya kapan saja demi keamanan:
1. Pada bagian pojok kiri bawah (footer sidebar), klik tombol **🔑 Password** atau klik profil pengguna Anda.
2. Masukkan **Password Lama** saat ini.
3. Masukkan **Password Baru** (minimal 6 karakter) dan **Konfirmasi Password Baru**.
4. Klik **Perbarui Password**.

---

### 5. Keamanan & Audit Log Login
* Seluruh kata sandi dienkripsi menggunakan algoritma **Salted SHA-256 Digest** sebelum disimpan di database.
* Data `passwordHash` dan `passwordSalt` tidak pernah dikirimkan ke frontend (terlindungi oleh fungsi sanitasi).
* Setiap percobaan login (baik berhasil `USER_LOGIN` maupun gagal `FAILED_LOGIN_ATTEMPT`) serta setiap perubahan password dicatat secara otomatis ke dalam **Activity Logs (Audit Trail)**.

---

## ❓ FAQ (Pertanyaan yang Sering Diajukan)

**Q: Apa yang terjadi jika suatu perkara dibatalkan?**
A: Perkara yang dibatalkan (*Cancelled*) akan disembunyikan dari dashboard operasional aktif, namun seluruh berkas, invoice, dan riwayat auditnya tetap tersimpan aman di database arsip. Notaris dapat memulihkannya kapan saja ke status aktif jika klien berubah pikiran.

**Q: Apakah staf dapat saling melihat perkara staf lain?**
A: Staf dapat melihat daftar perkara kantor untuk kebutuhan koordinasi, namun aksi-aksi kritis (seperti menghapus, override tahapan, atau pengaturan kantor) diproteksi secara ketat di level backend berdasarkan role masing-masing.

**Q: Mengapa tombol penandatanganan (Signing) menampilkan status NOT_READY?**
A: NOTARYGO™ memiliki mesin validasi kesiapan signing. Status `NOT_READY` muncul jika masih ada berkas persyaratan wajib yang berstatus `MISSING` atau `NEED_REVISION`, atau draft akta belum mendapatkan persetujuan. Ini mencegah risiko penandatanganan akta yang berkas pendukungnya belum lengkap.

**Q: Bagaimana cara menonaktifkan akun staf yang sudah tidak bekerja?**
A: Super Admin cukup masuk ke menu **Pengaturan & Profil** → pada tabel pengguna, klik tombol **Nonaktifkan** pada staf yang bersangkutan. Akun tersebut tidak akan dapat login lagi ke dalam sistem. Lakukan pula wizard handover untuk mengalihkan seluruh berkas perkaranya ke staf pengganti.

