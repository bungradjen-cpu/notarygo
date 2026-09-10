# NOTARYGO™ Superadmin — Database Schema & Data Dictionary

**Versi:** 1.0  
**Status:** Implemented (Additive Migration `0012_superadmin_platform_schema.sql`)  
**Target RDBMS:** Supabase PostgreSQL with Row Level Security (RLS)

---

## 1. Skema Tabel Inti Platform Admin

### `public.platform_admins`
Tabel pemetaan identitas Supabase Auth ke hak akses Platform Superadmin.

| Kolom | Tipe | Constraint | Deskripsi |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | ID unik admin record |
| `profile_id` | `uuid` | REFERENCES `public.profiles(id)` | Foreign key ke profil pengguna |
| `user_id` | `uuid` | REFERENCES `auth.users(id)` | Foreign key ke akun Supabase Auth |
| `email` | `text` | UNIQUE, NOT NULL | Email admin (wajib `bungradjen@gmail.com`) |
| `role` | `text` | CHECK (`role = 'PLATFORM_SUPERADMIN'`) | Role tunggal resmi platform |
| `status` | `text` | CHECK (`status IN ('ACTIVE', 'INACTIVE')`) | Status aktif admin |
| `created_at` | `timestamptz` | DEFAULT `now()` | Waktu pemberian hak akses |
| `last_login_at` | `timestamptz` | NULLABLE | Waktu login terakhir |

---

## 2. Skema Billing & Transaksi

### `public.billing_transactions` (Extended)
Tabel pencatatan transaksi pembayaran gateway Mayar.

| Kolom | Tipe | Constraint | Deskripsi |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | ID transaksi |
| `internal_reference` | `text` | UNIQUE, NOT NULL | Referensi unik internal (`NGPAY-...`) |
| `normalized_email` | `text` | NOT NULL | Email pembayar huruf kecil tersanitasi |
| `customer_name` | `text` | NOT NULL | Nama pembayar di invoice Mayar |
| `customer_phone` | `text` | NULLABLE | Nomor telepon / WhatsApp pembayar |
| `plan_code` | `text` | NOT NULL | Kode paket (`NOTARYGO_MONTHLY`, dll.) |
| `amount` | `numeric` | NOT NULL | Nominal tagihan resmi (Rp) |
| `status` | `text` | NOT NULL | `CREATED`, `MAYAR_PENDING`, `PAID`, `FAILED`, `EXPIRED` |
| `claim_status` | `text` | DEFAULT `'UNCLAIMED'` | `'UNCLAIMED'` atau `'CLAIMED'` |
| `organization_id` | `uuid` | FK `organizations(id)` | Kantor yang mengklaim pembayaran |
| `provider_payment_id`| `text` | NULLABLE | ID pembayaran dari Mayar |
| `provider_invoice_id`| `text` | NULLABLE | ID invoice dari Mayar |
| `created_at` | `timestamptz` | DEFAULT `now()` | Waktu transaksi di-create |
| `paid_at` | `timestamptz` | NULLABLE | Waktu pembayaran dikonfirmasi Mayar |
| `claimed_at` | `timestamptz` | NULLABLE | Waktu paket diklaim oleh akun kantor |

---

## 3. Skema Webhook & Rekonsiliasi

### `public.provider_webhook_events`
Log penerimaan event callback dari payment gateway secara idempotent.
- `id` UUID PK
- `provider` TEXT (Default `'MAYAR'`)
- `provider_event_id` TEXT
- `event_type` TEXT
- `transaction_id` UUID FK `billing_transactions`
- `provider_payment_id` TEXT
- `received_at` TIMESTAMPTZ
- `status` TEXT (`PROCESSED`, `DUPLICATE`, `INVALID`, `FAILED`)
- `retry_count` INTEGER
- `payload_sanitized` JSONB

### `public.reconciliation_items`
Antrean deteksi selisih data antara provider vs sistem internal.
- `id` UUID PK
- `type` TEXT (`PROVIDER_PAID_INTERNAL_PENDING`, `PAYMENT_PAID_SUBSCRIPTION_INACTIVE`)
- `transaction_id` UUID FK `billing_transactions`
- `subscription_id` UUID FK `subscriptions`
- `organization_id` UUID FK `organizations`
- `severity` TEXT (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`)
- `status` TEXT (`OPEN`, `RESOLVED`, `IGNORED`)
- `detected_at` TIMESTAMPTZ
- `resolved_at` TIMESTAMPTZ
- `resolution_note` TEXT

---

## 4. Skema CRM & Layanan Pelanggan

### `public.renewal_activities`
Pencatatan tindak lanjut perpanjangan langganan kantor notaris.
- `id` UUID PK
- `organization_id` UUID FK `organizations`
- `contact_status` TEXT (`NOT_CONTACTED`, `REMINDER_SENT`, `WHATSAPP_SENT`, `INTERESTED`, `RENEWED`, `DECLINED`)
- `channel` TEXT (`WHATSAPP`, `EMAIL`, `PHONE`)
- `note` TEXT

### `public.support_tickets`
Pencatatan kendala dan bantuan pengguna.
- `id` UUID PK
- `organization_id` UUID FK `organizations`
- `category` TEXT (`LOGIN`, `SIGNUP`, `PAYMENT`, `SUBSCRIPTION`, `DOCUMENT`, dll.)
- `priority` TEXT (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`)
- `status` TEXT (`OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`)
- `subject` TEXT, `description` TEXT

### `public.feedback_items`
Kotak aspirasi fitur & saran pengembangan.
- `id` UUID PK
- `organization_id` UUID FK `organizations`
- `category` TEXT (`BUG`, `IMPROVEMENT`, `FEATURE_REQUEST`, `COMPLAINT`)
- `message` TEXT
- `status` TEXT (`REQUESTED`, `UNDER_REVIEW`, `PLANNED`, `IN_DEVELOPMENT`, `RELEASED`)

---

## 5. Skema Audit & Pengaturan

### `public.platform_admin_audit_logs`
Catatan audit permanen (immutable) atas semua tindakan Superadmin.
- `id` UUID PK
- `admin_user_id` UUID FK `auth.users`
- `action` TEXT (`ADMIN_LOGIN`, `SUBSCRIPTION_OVERRIDE`, `PAYMENT_RECONCILED`, `CONFIG_CHANGED`)
- `target_type` TEXT, `target_id` TEXT
- `reason` TEXT
- `before_state` JSONB, `after_state` JSONB
- `created_at` TIMESTAMPTZ

### `public.platform_settings`
Penyimpanan parameter batas operasional platform (tanpa menyimpan rahasia/secret).
- `key` TEXT PK
- `value` JSONB
- `description` TEXT
- `updated_at` TIMESTAMPTZ
