# NOTARYGO™ Superadmin — Architecture Specification

**Versi:** 1.0  
**Tipe:** Platform Command Center  
**Authorized Admin:** `bungradjen@gmail.com` (`PLATFORM_SUPERADMIN`)

---

## 1. Arsitektur Domain Terpisah

NOTARYGO™ menggunakan model pemisahan keamanan domain dua tingkat:

```
+-------------------------------------------------------------------------+
|                         NOTARYGO™ PLATFORM                               |
+-------------------------------------------------------------------------+
|                                                                         |
|   [ 1. TENANT OPERATIONAL DOMAIN ]      [ 2. PLATFORM COMMAND CENTER ]  |
|   Route: /dashboard/*                   Route: /superadmin/*             |
|   Roles: OWNER, ADMIN, SUPERVISOR,      Role: PLATFORM_SUPERADMIN        |
|          STAFF, FINANCE                 Identity: bungradjen@gmail.com   |
|                                                                         |
|   - Isolasi data kantor (org_id)        - Cross-tenant visibility        |
|   - Pengelolaan Akta & Klien             - SaaS billing & Mayar control   |
|   - Operasional Harian Notaris          - Attention & Health monitoring  |
|   - Zero access to platform admin       - Zero access to deed body docs  |
|                                                                         |
+-------------------------------------------------------------------------+
|                    SUPABASE POSTGRESQL + RLS LAYER                      |
+-------------------------------------------------------------------------+
```

### Prinsip Utama:
1. **Single Superadmin Policy**:
   Hanya ada 1 akun platform admin di sistem produksi: `bungradjen@gmail.com`. Tidak ada hierarchy multi-admin atau admin delegation.
2. **Server-Side Enforcement**:
   Semua route `/superadmin/*` dan server action diwajibkan melewati verifikasi `requireSuperadmin()`. Client-side token tampering ditolak di level database dan server middleware.
3. **Privacy First**:
   Platform Command Center fokus pada metrik bisnis, status langganan, dan keandalan sistem teknis. Isi teks dokumen akta, data rahasia klien, hash password, dan secret payment gateway dilarang diekspos ke antarmuka Superadmin.

---

## 2. Struktur Navigasi Command Center (`/superadmin`)

Navigasi dibagi ke dalam 6 modul logis:

```
OVERVIEW
  ├── Dashboard (/superadmin)
  ├── Attention Center (/superadmin/attention)
  └── SaaS Metrics (/superadmin/metrics)

CUSTOMERS
  ├── Organizations (/superadmin/organizations)
  ├── Users & Membership (/superadmin/users)
  ├── Customer Health (/superadmin/customer-health)
  ├── Customer Lifecycle (/superadmin/customer-lifecycle)
  ├── Support (/superadmin/support)
  └── Feedback & Requests (/superadmin/feedback)

BILLING & SUBSCRIPTION
  ├── Subscriptions (/superadmin/subscriptions)
  ├── Transactions (/superadmin/transactions)
  ├── Unclaimed Payments (/superadmin/unclaimed-payments)
  ├── Webhook Events (/superadmin/webhooks)
  ├── Reconciliation Queue (/superadmin/reconciliation)
  ├── Renewal Operations (/superadmin/renewals)
  └── Refunds (/superadmin/refunds)

PRODUCT
  ├── Usage & Adoption (/superadmin/usage)
  ├── Feature Usage (/superadmin/usage/features)
  └── Plans & Entitlements (/superadmin/plans)

SYSTEM
  ├── System Health (/superadmin/system)
  ├── Errors & Incidents (/superadmin/errors)
  ├── Email Delivery (/superadmin/email)
  ├── Storage Usage (/superadmin/storage)
  └── Audit Logs (/superadmin/audit)

SETTINGS
  ├── Payment Provider (/superadmin/settings/payment-provider)
  └── Platform Configuration (/superadmin/settings/platform)
```

---

## 3. Data Flow & Siklus Pembayaran

```
1. Customer checkout paket (1 Bln / 3 Bln / 1 Thn) via link Mayar
   └── Menghasilkan billing_transaction (status: MAYAR_PENDING, claim_status: UNCLAIMED)

2. Mayar mengirimkan Webhook pembayaran berhasil
   ├── Disimpan di provider_webhook_events (idempotent, payload tersanitasi)
   └── billing_transaction di-update -> PAID

3. Customer melakukan registrasi / pembuatan kantor:
   ├── Jika email persis sama:
   │   └── claim_status -> CLAIMED, subscription aktif sesuai durasi paket.
   └── Jika customer belum registrasi:
       └── Masuk ke Attention Center & antrean Unclaimed Payments.

4. Menjelang akhir masa aktif (30D, 14D, 7D, Expired):
   └── Masuk ke antrean Renewal Operations untuk tindak lanjut via WhatsApp/Email.
```
