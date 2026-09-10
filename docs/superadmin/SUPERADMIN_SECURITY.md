# NOTARYGO™ Superadmin — Security & Authorization Architecture

**Versi:** 1.0  
**Tingkat Kerahasiaan:** Confidential Platform Policy  
**Authorized Platform Superadmin:** `bungradjen@gmail.com`

---

## 1. Single Superadmin Policy

Sesuai rancangan tata kelola platform NOTARYGO™:
1. Hanya ada **1 (satu)** Platform Superadmin yang diizinkan dalam sistem: `bungradjen@gmail.com` dengan peran `PLATFORM_SUPERADMIN`.
2. Tidak ada peran perantara (seperti `BILLING_ADMIN`, `SUPPORT_ADMIN`, `TECH_ADMIN`, atau `SECONDARY_SUPERADMIN`).
3. Tidak disediakan antarmuka pengguna (UI) untuk mengundang, membuat, atau menaikkan status pengguna tenant menjadi Superadmin.
4. Pemilik kantor notaris (`OWNER`) sama sekali tidak mendapatkan hak akses platform Superadmin.

---

## 2. Lapisan Validasi Otorisasi Ganda (Two-Tier Server Authorization)

Untuk mengakses setiap rute `/superadmin/*` atau memanggil endpoint API `/api/superadmin/*`, helper `requireSuperadmin()` memvalidasi dua kriteria wajib secara server-side:

```
[ Incoming Request ]
         │
         ▼
1. Authenticated User Check (Supabase Auth)
   - Apakah pengguna login? (Anonymous langsung ditolak 401)
         │
         ▼
2. Normalized Email Check
   - Apakah email terkonfirmasi = 'bungradjen@gmail.com'? (Jika tidak, 403)
         │
         ▼
3. Platform Admin Database Record Verification
   - Cek record di public.platform_admins:
     • role = 'PLATFORM_SUPERADMIN'
     • status = 'ACTIVE'
   - Menolak jika record berstatus INACTIVE atau dicabut
         │
         ▼
[ Akses Diberikan ke Command Center ]
```

**Pertahanan terhadap Client-Side Tampering**:
- Verifikasi otorisasi sepenuhnya dijalankan di lingkungan runtime Node.js server (Server Components / Server Actions / Route Handlers).
- Manipulasi LocalStorage, token metadata browser, ataupun header palsu tidak dapat memengaruhi validasi server-side.

---

## 3. Row Level Security (RLS) Isolation

- Seluruh tabel platform (`platform_admins`, `provider_webhook_events`, `reconciliation_items`, `renewal_activities`, `platform_admin_audit_logs`, `platform_settings`) dilindungi Row Level Security.
- Kebijakan RLS memanggil stored function berkeamanan tinggi `public.is_platform_admin()`.
- Pengguna kantor notaris (tenant) **tidak memiliki hak baca (SELECT) maupun tulis (INSERT/UPDATE/DELETE)** ke tabel-tabel platform tersebut.

---

## 4. Perlindungan Privasi & Data Rahasia Notaris

Superadmin bertindak sebagai operator platform SaaS, **bukan pembaca dokumen rahasia akta**. Kebijakan privasi berikut diterapkan secara ketat:
1. **Zero Raw Document Exposure**: Antarmuka Superadmin tidak menyediakan fitur pratinjau atau pembacaan isi teks akta notaris.
2. **Kerahasiaan Kredensial**: Password pengguna tidak pernah diekspos maupun disimpan dalam bentuk teks biasa.
3. **Penyembunyian Rahasia Gateway**: Kunci rahasia Mayar (`MAYAR_API_KEY`, `MAYAR_WEBHOOK_SECRET`) dan `SUPABASE_SERVICE_ROLE_KEY` tidak pernah di-render ke browser.
4. **Log Audit Permanen (Immutable)**: Setiap aksi administratif (perpanjangan masa aktif kantor, penyelesaian rekonsiliasi, perubahan pengaturan platform) otomatis dicatat dalam `platform_admin_audit_logs` bersama alasan dan timestamp.
