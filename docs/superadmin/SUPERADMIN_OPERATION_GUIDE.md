# NOTARYGO™ Superadmin — Standard Operating Procedures (SOP) & Operation Guide

**Versi:** 1.0  
**Sasaran:** Platform Superadmin (`bungradjen@gmail.com`)  
**URL Command Center:** `https://notarygo.id/superadmin` (atau `http://localhost:3000/superadmin`)

---

## 1. Panduan Rutin Harian (30-Second Morning Check)

Setiap pagi, buka `/superadmin` dan lakukan pengecekan 30 detik:
1. **Periksa Attention Center**:
   - Apakah terdapat kotak merah *Critical*?
   - Cek apakah ada **Unclaimed Payment** (customer sudah membayar di Mayar namun belum membuat kantor).
   - Cek apakah ada transaksi pending &gt; 24 jam.
2. **Tinjau Revenue & Subscriptions**:
   - Pastikan metrik *Revenue Bulan Ini* bertambah sesuai notifikasi Mayar.
   - Periksa jumlah *Langganan Aktif*.
3. **Cek Kesehatan Infrastruktur**:
   - Pastikan indikator *Mayar*, *Database*, dan *Webhook* menyala hijau (Active).

---

## 2. Prosedur Penanganan Pembayaran Belum Diklaim (Unclaimed Payments)

Kasus: Pelanggan melakukan pembayaran melalui QRIS/Virtual Account Mayar, namun belum pernah mendaftar di NOTARYGO™.

**Langkah Penanganan:**
1. Masuk ke menu **BILLING & SUBSCRIPTION** &rarr; **Unclaimed Payments** (`/superadmin/unclaimed-payments`).
2. Temukan transaksi yang sesuai dengan nama/email customer.
3. Klik tombol **Teks WhatsApp**.
4. Salin pesan otomatis yang disediakan:
   > *"Halo Bapak/Ibu [Nama], terima kasih telah berlangganan NOTARYGO™... Silakan mendaftar di https://notarygo.id/auth/login menggunakan email Anda: [Email]."*
5. Kirimkan pesan tersebut ke nomor WhatsApp pelanggan.
6. Saat pelanggan mendaftar dengan email yang sama, sistem secara otomatis:
   - Memvalidasi email;
   - Mengaitkan transaksi;
   - Mengubah status klaim menjadi `CLAIMED`;
   - Mengaktifkan langganan kantor sesuai paket (1 Bulan / 3 Bulan / 1 Tahun).

---

## 3. Prosedur Operasi Renewal (Perpanjangan Langganan)

Kasus: Kantor notaris mendekati masa akhir langganan (H-7 atau H-3).

**Langkah Penanganan:**
1. Buka menu **BILLING & SUBSCRIPTION** &rarr; **Renewal Operations** (`/superadmin/renewals`).
2. Pilih tab **Habis Dalam 7 Hari** atau **Kedaluwarsa Hari Ini**.
3. Klik **Catat Tindak Lanjut** pada kantor yang ditargetkan.
4. Hubungi kontak notaris / sekretaris via WhatsApp atau telepon.
5. Pilih status respon: `Pesan WhatsApp Terkirim`, `Berminat Perpanjang`, dll.
6. Masukkan catatan ringkas dan klik **Simpan Catatan** (akan otomatis tersimpan di CRM dan log audit).

---

## 4. Prosedur Rekonsiliasi & Perpanjangan Manual Terkendali

Kasus: Notaris melakukan perpanjangan khusus atau terdapat selisih pencatatan.

**Aturan Keamanan:**
- Tidak ada tombol ubah status sembarangan (*no casual free-form dropdown*).
- Setiap aksi perpanjangan manual wajib menyertakan **Alasan Perubahan** minimal 5 karakter.
- Alasan, identitas admin, waktu, sebelum, dan sesudah perubahan dicatat permanen dalam `platform_admin_audit_logs`.
