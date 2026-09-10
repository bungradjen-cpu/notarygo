# REUSABLE BUSINESS RULES & LOGIC

Walaupun infrastruktur Google Apps Script (GAS) akan dibuang (Drop/Rebuild), aturan bisnis (*Business Rules*) dari NOTARYGO™ Legacy yang tercermin dalam kode sumbernya bersifat *agnostic* (tidak bergantung pada bahasa pemrograman) dan **WAJIB DISALIN (PORTING)** ke dalam aplikasi SaaS (Node.js/Next.js/Supabase).

Berikut adalah ringkasan logika bisnis utama yang diekstraksi dari hasil audit:

## 1. Perlindungan Relasional (Cascade & Restrict)
Diterapkan di Legacy: `MatterService.gs`, `ClientService.gs`, `BillingService.gs`
- **RESTRICT Deletion (Client/Organization)**: Klien atau Mitra Organisasi **TIDAK BOLEH DIHAPUS** jika mereka masih memiliki `Matters` (Perkara) yang terdaftar atas nama mereka (aktif maupun selesai). Hal ini untuk melindungi sejarah operasional.
- **RESTRICT Deletion (Invoice)**: Invoice **TIDAK BOLEH DIHAPUS atau DI-EDIT nominalnya** jika `paidAmount > 0` (sudah ada pembayaran sebagian). Jika ingin mengedit, pembayaran terkait harus dibatalkan (void) terlebih dahulu.
- **CASCADE Deletion (Matters)**: Jika sebuah perkara (Matter) dibatalkan/dihapus (misal oleh Super Admin karena salah input), maka seluruh entitas anak (`Tasks`, `Checklists`, `Signings`, `Documents`) harus dihapus secara atomik (bersamaan).

## 2. Kalkulasi Finansial (Invoices & Payments)
Diterapkan di Legacy: `BillingService.gs`
- **Outstanding Calculation**: `Outstanding = (Subtotal - Discount + Tax) - PaidAmount`.
- **Status Transisi Otomatis (State Machine)**:
  - Jika `PaidAmount == 0` -> Status: `UNPAID`
  - Jika `0 < PaidAmount < Total` -> Status: `PARTIAL`
  - Jika `PaidAmount >= Total` -> Status: `PAID` (Lunas)

## 3. Sistem Sekuensing Penomoran (Auto-Numbering)
Diterapkan di Legacy: `Sequence.gs`
Format nomor dokumen (Matter, Invoice, Task) memiliki aturan yang ketat dan spesifik:
- **Invoice Number**: `{Prefix_INV}/{Bulan_Romawi}/{Tahun}/{Sequence}`. Contoh: `INV/VIII/2026/0015`.
- **Matter Number**: `{Prefix_ACT}/{Service_Code}/{Tahun}/{Sequence}`.
> **Instruksi SaaS**: Di PostgreSQL, logika ini dapat diimplementasikan sebagai `Database Trigger` (PL/pgSQL) sebelum `INSERT` untuk menjamin kondisi bebas *race-condition* saat dua staf meng-create invoice bersamaan.

## 4. Alur Kerja (Workflow Generation)
Diterapkan di Legacy: `WorkflowService.gs`
Ketika Matter baru dibuat, sistem secara otomatis menerjemahkan JSON Template dari Master Layanan menjadi *Tasks* dan *Checklist*.
- Jika layanan X memerlukan dokumen Y, otomatis terbit baris kosong (Pending) di *Document Center*.
- Jika layanan X memiliki tahapan tugas standar Z1, Z2, Z3, otomatis ter-assign ke staf (PIC).

## 5. Security & Access Control (RBAC Dasar)
Diterapkan di Legacy: `Permissions.gs`
- **SUPER_ADMIN**: Akses penuh, dapat menghapus data (Hard Delete), mengatur konfigurasi kantor, dan mengelola user/password staf.
- **ADMIN**: Dapat membuat, mengedit, dan mengelola operasional serta finansial (Invoicing). Tidak bisa menghapus master data.
- **STAFF**: Hanya dapat melihat dan memperbarui status pada Task yang di-assign kepada mereka, serta mengunggah dokumen (Document Center). Tidak ada akses finansial (Billing tab tersembunyi).
