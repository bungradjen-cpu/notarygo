# NOTARYGO™ Superadmin — Financial & Operational Metrics Definitions

**Versi:** 1.0  
**Tujuan:** Menjamin kebenaran kalkulasi finansial tanpa angka fiktif dan sesuai dengan model B2B SaaS tanpa trial.

---

## 1. Definisi Metrik Pendapatan (Revenue Metrics)

### Revenue Bulan Berjalan (Revenue This Month)
- **Definisi:** Total nilai nominal (IDR) seluruh transaksi yang berstatus `PAID` atau `CLAIMED` yang tanggal pembayarannya (`paid_at` atau `created_at`) berada dalam rentang bulan kalender berjalan (mulai tanggal 1 pukul 00:00:00 hingga saat ini).
- **Aturan Ketat:**
  - `MAYAR_PENDING` **TIDAK BOLEH** dihitung sebagai revenue.
  - `FAILED`, `EXPIRED`, `CANCELLED` **TIDAK BOLEH** dihitung sebagai revenue.
  - Transaksi duplikat dari webhook berulang **HANYA DIHITUNG SATU KALI**.
  - Transaksi uji coba (test records) dilarang dimasukkan dalam agregasi produksi.

### Nilai Transaksi Rata-Rata (Average Order Value / AOV)
$$\text{AOV} = \frac{\text{Total Paid Revenue}}{\text{Jumlah Transaksi Berbayar}}$$

### Nilai Ekivalen Bulanan (Monthly-Equivalent MRR Label)
- Karena NOTARYGO™ menggunakan model pembayaran di muka (prepaid plans: 1 Bulan, 3 Bulan, 1 Tahun), nilai ekivalen bulanan dinyatakan secara transparan sebagai nilai amortisasi bulanan dari paket aktif, bukan akuntansi MRR berbasis kartu kredit auto-recurring.

---

## 2. Definisi Metrik Langganan & Pelanggan (Customer & Retention Metrics)

### Langganan Aktif (Active Subscriptions)
- Organisasi dengan status `ACTIVE` pada tabel `subscriptions` dan masa berlaku (`current_period_end`) belum terlewati saat query dijalankan.

### Pelanggan Berbayar Baru (New Paying Customers)
- Jumlah unik email pembayar yang menyelesaikan pembayaran pertama kali pada bulan kalender berjalan. Satu kantor dengan beberapa staf tetap dihitung sebagai satu pelanggan berbayar.

### Renewal Rate (%)
$$\text{Renewal Rate} = \frac{\text{Jumlah Langganan Aktif}}{\text{Jumlah Langganan Aktif} + \text{Jumlah Langganan Expired}} \times 100\%$$

### Rasio Keberhasilan Pembayaran (Payment Success Rate %)
$$\text{Payment Success Rate} = \frac{\text{Jumlah Transaksi PAID}}{\text{Total Transaksi Selesai (PAID + FAILED + EXPIRED)}} \times 100\%$$

---

## 3. Definisi Status Kesehatan Tenant (Customer Health Rules)

Status kesehatan dihitung secara deterministik berbasis aturan bisnis transparan:

| Status Health | Kriteria Penentu | Rekomendasi Tindakan |
| :--- | :--- | :--- |
| **HEALTHY** | Masa aktif langganan tersisa &gt; 14 hari dan terdapat pembuatan akta/perkara aktif. | Pertahankan hubungan baik. |
| **WATCH** | Masa aktif tersisa antara 4 hingga 14 hari, atau kantor belum membuat perkara dalam 14 hari terakhir. | Kirim pengingat renewal awal via WhatsApp. |
| **AT_RISK** | Masa aktif tersisa &le; 3 hari, atau langganan telah `EXPIRED`, atau kantor tidak aktif &gt; 30 hari. | Eskalasi follow-up personal prioritas tinggi. |
