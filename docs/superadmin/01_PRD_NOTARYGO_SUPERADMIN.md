# PRD NOTARYGO™ SUPERADMIN
## Platform Command Center untuk NOTARYGO™ SaaS

**Versi:** 1.0  
**Status:** Build Specification  
**Produk:** NOTARYGO™ SaaS  
**Kategori:** B2B SaaS - Legal Technology  
**Target Admin:** Satu Platform Superadmin  
**Authorized Superadmin:** `bungradjen@gmail.com`

---

# 1. Ringkasan Produk

NOTARYGO™ Superadmin adalah **Platform Administration System** untuk mengelola seluruh ekosistem SaaS NOTARYGO™ dari sisi operator platform.

Superadmin bukan dashboard operasional kantor notaris. Superadmin berfungsi sebagai **Platform Command Center** untuk menjawab pertanyaan inti:

- Siapa customer NOTARYGO™?
- Siapa yang sudah membayar?
- Siapa yang belum berhasil aktif?
- Subscription mana yang segera berakhir?
- Payment mana yang gagal atau tidak sinkron?
- Siapa yang sudah bayar tetapi belum membuat akun?
- Customer mana yang tidak menggunakan produk?
- Fitur apa yang paling banyak digunakan?
- Masalah apa yang memerlukan tindakan hari ini?
- Apakah Mayar, webhook, database, auth, storage, email, dan sistem dalam kondisi sehat?

Prinsip utama:

> **Attention First, Platform Control, Minimum Necessary Access.**

---

# 2. Tujuan Produk

## 2.1 Tujuan Bisnis

Superadmin harus membantu operator NOTARYGO™:

1. Mengontrol customer dan subscription dari satu tempat.
2. Mengurangi customer berbayar yang gagal aktivasi.
3. Mengurangi kehilangan revenue akibat payment/webhook/reconciliation failure.
4. Meningkatkan renewal rate.
5. Menemukan customer yang berisiko churn.
6. Mengetahui adopsi produk secara nyata.
7. Menangani support dan feedback secara terstruktur.
8. Mengetahui kondisi teknis platform tanpa membuka data rahasia tenant secara berlebihan.

## 2.2 Tujuan Operasional

Dashboard harus memungkinkan Superadmin melihat dalam 30 detik:

- revenue bulan berjalan;
- jumlah subscription aktif;
- customer baru membayar;
- payment problem;
- unclaimed payment;
- subscription expiring;
- customer health;
- activation funnel;
- webhook/system health;
- attention required.

---

# 3. Scope Produk

## 3.1 In Scope

- Platform Superadmin authentication/authorization
- Dashboard / Platform Command Center
- Attention Center
- SaaS Metrics
- Organizations
- Users & Membership
- Customer Health
- Customer Lifecycle
- Support
- Feedback & Feature Requests
- Subscriptions
- Transactions
- Unclaimed Payments
- Webhook Events
- Reconciliation Queue
- Renewal Operations
- Refunds (jika provider mendukung)
- Usage & Adoption
- Feature Usage
- Plans & Entitlements
- System Health
- Errors & Incidents
- Email Delivery
- Storage Usage
- Audit Logs
- Payment Provider settings/status
- Platform Configuration

## 3.2 Out of Scope

- Free trial
- Trial 7/14 hari
- Trial conversion
- Multi-platform-admin management
- Billing Admin
- Support Admin
- Tech Admin
- Create/Invite additional Superadmin
- Membaca isi dokumen notarial tenant secara rutin
- Membuka password user
- Menampilkan API key atau webhook secret
- Mengubah payment menjadi PAID secara manual tanpa bukti provider

---

# 4. Model Bisnis Tanpa Trial

NOTARYGO™ tidak menggunakan trial.

Lifecycle utama:

```text
LEAD
→ CHECKOUT_STARTED
→ PAYMENT_PENDING
→ PAID
→ PAID_UNCLAIMED
→ REGISTERED
→ ONBOARDING
→ ACTIVATED
→ ACTIVE_CUSTOMER
→ EXPIRING_SOON
→ RENEWED
```

Jika tidak memperpanjang:

```text
EXPIRING_SOON
→ EXPIRED
```

Jika dibatalkan:

```text
ACTIVE_CUSTOMER
→ CANCELLED
```

---

# 5. Paket Subscription

| Kode | Nama | Harga | Durasi |
|---|---|---:|---:|
| NOTARYGO_MONTHLY | 1 Bulan | Rp129.000 | 1 bulan |
| NOTARYGO_QUARTERLY | 3 Bulan | Rp249.000 | 3 bulan |
| NOTARYGO_ANNUAL | 1 Tahun | Rp499.000 | 12 bulan |

Paket tahunan diberi label **BEST VALUE**.

Perbedaan paket pada tahap ini terutama durasi dan harga, bukan core feature, kecuali entitlement yang sudah resmi ditentukan di aplikasi.

---

# 6. Security Model

## 6.1 Single Superadmin

Hanya satu akun yang memiliki akses platform:

`bungradjen@gmail.com`

Role:

`PLATFORM_SUPERADMIN`

Tidak ada UI untuk:

- membuat Superadmin baru;
- mengundang admin;
- menambah Billing Admin;
- menambah Support Admin;
- menambah Tech Admin;
- mendelegasikan role platform.

## 6.2 Authorization

Akses `/superadmin` hanya diizinkan jika:

1. User terautentikasi melalui Supabase Auth.
2. Normalized email = `bungradjen@gmail.com`.
3. Ada record aktif di `platform_admins`.
4. Role = `PLATFORM_SUPERADMIN`.
5. Status = `ACTIVE`.

Semua validasi harus dilakukan **server-side**.

Jangan menggunakan client-side email check sebagai security boundary.

## 6.3 Credential Policy

Bootstrap credential tidak boleh:

- di-hardcode di frontend;
- masuk migration SQL;
- masuk repository;
- masuk log;
- masuk dokumentasi hasil akhir;
- dikirim melalui `NEXT_PUBLIC_*`.

Password hanya dikelola Supabase Auth.

---

# 7. Sidebar Information Architecture

```text
NOTARYGO™ SUPERADMIN

OVERVIEW
- Dashboard
- Attention Center
- SaaS Metrics

CUSTOMERS
- Organizations
- Users & Membership
- Customer Health
- Customer Lifecycle
- Support
- Feedback & Feature Requests

BILLING & SUBSCRIPTION
- Subscriptions
- Transactions
- Unclaimed Payments
- Webhook Events
- Reconciliation Queue
- Renewal Operations
- Refunds

PRODUCT
- Usage & Adoption
- Feature Usage
- Plans & Entitlements

SYSTEM
- System Health
- Errors & Incidents
- Email Delivery
- Storage Usage
- Audit Logs

SETTINGS
- Payment Provider
- Platform Configuration
```

Tidak ada menu **Admin Users**.

---

# 8. Dashboard / Platform Command Center

Route:

`/superadmin`

## 8.1 KPI Utama

- Revenue This Month
- Active Subscriptions
- New Paying Customers
- Active Offices
- Renewal Rate
- Payment Success Rate

## 8.2 KPI Sekunder

- Total Organizations
- Activated Organizations
- At Risk Customers
- Unclaimed Payments
- Expiring Soon
- Critical Incidents

## 8.3 Attention Required

Dashboard harus menampilkan queue singkat seperti:

- Paid but not registered
- Paid but subscription inactive
- Unclaimed payment
- Payment failed
- Payment pending terlalu lama
- Webhook failed
- Reconciliation required
- Subscription expiring today
- Subscription expiring <= 7 hari
- Onboarding incomplete
- No first matter
- Inactive customer
- Storage warning
- Email delivery failure
- Critical system error

Setiap item dapat diklik menuju halaman tindakan terkait.

## 8.4 Activation Funnel

```text
PAID
↓
ACCOUNT CREATED
↓
OFFICE CREATED
↓
ONBOARDING COMPLETE
↓
FIRST MATTER
↓
FIRST TEAM MEMBER
↓
FIRST DOCUMENT
↓
ACTIVE USAGE
```

## 8.5 Subscription Expiry

- Expiring Today
- 7 Days
- 14 Days
- 30 Days

## 8.6 Customer Health

- Healthy
- Watch
- At Risk

## 8.7 Recent Activity

- Recent Payments
- Recent Signups
- Recent Subscription Changes
- Recent Support Issues

## 8.8 System Health Summary

- Application
- Database
- Supabase Auth
- Storage
- Mayar
- Webhook
- Email
- PDF Generation

Status:

- HEALTHY
- DEGRADED
- CRITICAL
- UNKNOWN
- NOT_MONITORED

---

# 9. Attention Center

Route:

`/superadmin/attention`

## 9.1 Tipe Attention

- PAID_BUT_NOT_REGISTERED
- PAID_BUT_SUBSCRIPTION_INACTIVE
- UNCLAIMED_PAYMENT
- PAYMENT_FAILED
- PAYMENT_PENDING_TOO_LONG
- WEBHOOK_FAILED
- RECONCILIATION_REQUIRED
- SUBSCRIPTION_EXPIRING_TODAY
- SUBSCRIPTION_EXPIRING_7D
- ONBOARDING_INCOMPLETE
- NO_FIRST_MATTER
- INACTIVE_CUSTOMER
- STORAGE_WARNING
- EMAIL_DELIVERY_FAILURE
- CRITICAL_SYSTEM_ERROR

## 9.2 Severity

- CRITICAL
- HIGH
- MEDIUM
- LOW

## 9.3 Data Item

- severity
- type
- title
- organization
- user/customer
- transaction/subscription reference
- detected_at
- reason
- recommended_action
- status
- resolved_at

---

# 10. Organizations

Route:

`/superadmin/organizations`

## 10.1 Table Columns

- Organization
- Owner
- Owner Email
- Subscription Plan
- Subscription Status
- Start Date
- End Date
- Days Remaining
- Members
- Active Matters
- Storage Used
- Last Activity
- Onboarding Status
- Customer Health
- Created At

## 10.2 Filters

- ALL
- ACTIVE
- EXPIRING_SOON
- EXPIRED
- CANCELLED
- SUSPENDED
- NEW
- INACTIVE
- AT_RISK
- HIGH_USAGE

## 10.3 Detail Page

Route:

`/superadmin/organizations/[id]`

Tabs:

- Overview
- Subscription
- Usage
- Members
- Billing
- Health
- Support
- Activity

Data sensitif dokumen tidak ditampilkan secara default.

---

# 11. Users & Membership

Route:

`/superadmin/users`

Columns:

- Name
- Email
- Organization
- Organization Role
- Account Status
- Email Verified
- Created At
- Last Login

Role tenant:

- OWNER
- ADMIN
- SUPERVISOR
- STAFF
- FINANCE

Search:

- email
- nama
- nama kantor

Superadmin tidak dapat melihat password.

---

# 12. Subscription Control Center

Route:

`/superadmin/subscriptions`

Columns:

- Organization
- Plan
- Amount
- Status
- Start
- End
- Days Remaining
- Last Payment
- Renewal Status

Filters:

- ACTIVE
- EXPIRING_7D
- EXPIRING_14D
- EXPIRING_30D
- EXPIRED
- CANCELLED
- SUSPENDED

Actions:

- View
- Reconcile
- Add Admin Note
- Suspend (controlled)
- Reactivate via controlled workflow

Manual override wajib menyimpan:

- before
- after
- admin
- reason
- timestamp

---

# 13. Transactions

Route:

`/superadmin/transactions`

Columns:

- Internal Reference
- Customer Name
- Normalized Email
- Organization
- Plan
- Amount
- Currency
- Provider
- Provider Payment ID
- Status
- Created At
- Paid At
- Claim State

Payment status mengikuti schema nyata aplikasi, contoh:

- CREATED
- MAYAR_PENDING
- PAID
- FAILED
- EXPIRED
- REFUNDED
- CLAIMED

---

# 14. Unclaimed Payments

Route:

`/superadmin/unclaimed-payments`

Tujuan:

Mengidentifikasi customer yang sudah membayar tetapi belum memiliki/menautkan akun NOTARYGO™.

Columns:

- Email
- Customer Name
- Plan
- Amount
- Paid At
- Days Since Payment
- Account Exists
- Organization Exists
- Claim Status

Actions:

- View Payment
- Check Account
- Copy Signup Instruction
- Mark Contacted
- Add Note

Tidak boleh ada action manual untuk mengubah payment menjadi PAID tanpa provider verification.

---

# 15. Webhook Events

Route:

`/superadmin/webhooks`

Columns:

- Provider Event ID
- Event Type
- Transaction
- Provider Payment ID
- Received At
- Processed At
- Status
- Retry Count
- Error

Status:

- PROCESSED
- DUPLICATE
- INVALID
- FAILED
- IGNORED
- NEEDS_REVIEW

Metrics:

- Webhook Success Rate
- Received 24h
- Failed 24h
- Last Success
- Last Failure

---

# 16. Reconciliation Queue

Route:

`/superadmin/reconciliation`

Contoh mismatch:

- Mayar PAID, internal PENDING
- Payment PAID, subscription INACTIVE
- Payment CLAIMED, organization_id NULL
- Payment PAID, entitlement tidak aktif

Fields:

- Type
- Transaction
- Organization
- Expected State
- Actual State
- Severity
- Detected At
- Status

Actions:

- Inspect
- Retry Safe Reconciliation
- Resolve with Note

Seluruh action harus diaudit.

---

# 17. Renewal Operations

Route:

`/superadmin/renewals`

Queues:

- Expiring Today
- Expiring 7 Days
- Expiring 14 Days
- Expiring 30 Days
- Expired 1-7 Days
- Expired 8-30 Days

Columns:

- Organization
- Owner
- Email
- Phone
- Plan
- Current End Date
- Last Activity
- Customer Health
- Renewal Status
- Contact Status

Contact statuses:

- NOT_CONTACTED
- REMINDER_SENT
- WHATSAPP_SENT
- INTERESTED
- RENEWED
- NO_RESPONSE
- DECLINED

---

# 18. Refunds

Route:

`/superadmin/refunds`

Hanya aktif jika workflow/provider mendukung.

Fields:

- Transaction
- Customer
- Organization
- Amount
- Reason
- Requested At
- Provider Status
- Internal Status
- Resolved At
- Resolved By

Tidak boleh membuat status refund provider palsu.

---

# 19. Customer Health

Route:

`/superadmin/customer-health`

Status:

- HEALTHY
- WATCH
- AT_RISK

Signal contoh:

- subscription status
- days until expiry
- last login
- onboarding completion
- first matter
- first team member
- first document
- recent product activity
- support issues
- payment issues

Rules harus transparan dan dapat diuji.

---

# 20. Customer Lifecycle

Route:

`/superadmin/customer-lifecycle`

Tampilkan jumlah customer pada setiap stage dan conversion/drop-off antartahap.

Tidak boleh menciptakan stage yang tidak didukung event nyata.

---

# 21. Usage & Adoption

Route:

`/superadmin/usage`

Metrics:

- Organizations Active 7D
- Organizations Active 30D
- Users Active 7D
- Users Active 30D
- Matters Created
- Tasks Created
- Documents Uploaded
- PDFs Generated
- Invoices Created
- Staff Invited
- Onboarding Completed

---

# 22. Feature Usage

Route:

`/superadmin/usage/features`

Modules:

- Dashboard
- My Work
- Attention Required
- Matter
- Tasks
- Clients
- Partners
- Signing
- Checklist
- Document Center
- Operational Billing
- Reports

Metrics:

- Organizations Using
- Usage Last 7D
- Usage Last 30D

Tidak menyimpan/menampilkan isi dokumen customer.

---

# 23. Support Center

Route:

`/superadmin/support`

Fields:

- Organization
- Customer
- Category
- Priority
- Status
- Assigned To (single superadmin)
- Created At
- Updated At
- Resolved At

Status:

- OPEN
- IN_PROGRESS
- WAITING_CUSTOMER
- RESOLVED
- CLOSED

Categories:

- LOGIN
- SIGNUP
- PAYMENT
- SUBSCRIPTION
- TEAM
- CLIENT
- PARTNER
- MATTER
- DOCUMENT
- BILLING
- PDF
- ERROR
- FEATURE_REQUEST
- OTHER

---

# 24. Feedback & Feature Requests

Route:

`/superadmin/feedback`

Customer dapat memberikan:

> “Fitur apa yang Anda harapkan untuk aplikasi ini?”

Categories:

- BUG
- IMPROVEMENT
- FEATURE_REQUEST
- COMPLAINT
- GENERAL_FEEDBACK

Internal workflow:

- REQUESTED
- UNDER_REVIEW
- PLANNED
- IN_DEVELOPMENT
- RELEASED
- REJECTED

Tampilkan aggregate jumlah organisasi yang meminta request serupa.

---

# 25. Plans & Entitlements

Route:

`/superadmin/plans`

Fields:

- Plan Code
- Name
- Price
- Duration
- Active
- Entitlements

Potential entitlement:

- max_members
- max_active_matters
- storage_limit_bytes
- pdf_generation
- operational_billing
- email_notifications
- advanced_reports
- custom_branding

Jangan membuat perbedaan feature paket hanya karena durasi berbeda kecuali bisnis memang menentukan demikian.

---

# 26. System Health

Route:

`/superadmin/system`

Services:

- Application
- Database
- Supabase Auth
- Supabase Storage
- Mayar
- Webhook
- Email
- PDF Generation

Tidak boleh menampilkan HEALTHY jika tidak ada telemetry. Gunakan `NOT_MONITORED`.

---

# 27. Errors & Incidents

Route:

`/superadmin/errors`

Fields:

- Time
- Service
- Severity
- Route/Operation
- Organization (jika relevan)
- Error Code
- Status

Tidak boleh menampilkan secret, token, raw password, atau isi dokumen.

---

# 28. Email Delivery

Route:

`/superadmin/email`

Jika provider mendukung:

- Sent
- Delivered
- Failed
- Bounced
- Pending

Categories:

- Account Verification
- Team Invitation
- Payment
- Subscription
- Renewal
- System Notification

Jika provider tidak memiliki delivery metric, tampilkan data yang memang tersedia saja.

---

# 29. Storage Usage

Route:

`/superadmin/storage`

Columns:

- Organization
- Storage Used
- Document Count
- Quota
- Usage %
- Last Upload

Alert threshold:

- 80%
- 90%
- 100%

Tidak menyediakan browsing isi dokumen secara rutin.

---

# 30. Platform Audit Log

Route:

`/superadmin/audit`

Tabel immutable:

`platform_admin_audit_logs`

Fields:

- id
- admin_user_id
- action
- target_type
- target_id
- reason
- before_state
- after_state
- metadata
- created_at

Normal UI tidak boleh UPDATE/DELETE log.

Minimum events:

- ADMIN_LOGIN
- SUBSCRIPTION_OVERRIDE
- SUBSCRIPTION_SUSPENDED
- SUBSCRIPTION_REACTIVATED
- PAYMENT_RECONCILED
- REFUND_ACTION
- TENANT_STATUS_CHANGED
- SUPPORT_ACCESS
- CONFIG_CHANGED

---

# 31. Settings - Payment Provider

Route:

`/superadmin/settings/payment-provider`

Tampilkan hanya status aman:

- Provider: Mayar
- Environment: Sandbox / Production
- API Configuration: Configured / Missing
- Webhook: Configured / Missing
- Last Successful Webhook
- Last Webhook Error

Jangan tampilkan:

- API Key
- Webhook Secret
- Supabase service-role key

---

# 32. Settings - Platform Configuration

Route:

`/superadmin/settings/platform`

Konfigurasi aman:

- renewal reminder threshold
- customer health threshold
- inactivity threshold
- attention threshold
- support configuration
- feature flags jika framework sudah ada

Security control tidak boleh dijadikan toggle sembarangan.

---

# 33. UI/UX Guideline

## 33.1 Brand Palette

- Notary Navy `#0B1F4D`
- Deep Navy `#07152F`
- Notary Gold `#E89A0C`
- Warm Gold `#F4B341`
- Cloud White `#F8FAFC`
- Pure White `#FFFFFF`
- Primary Text `#10213D`
- Secondary Text `#64748B`
- Border `#E2E8F0`
- Success `#059669`
- Warning `#D97706`
- Critical `#DC2626`

## 33.2 Visual Philosophy

- Enterprise
- Operational
- Dense but readable
- Fast
- Trustworthy
- Attention-first

Hindari:

- glassmorphism
- neon
- gradient berlebihan
- dekorasi yang mengganggu operasional

## 33.3 Desktop First

Target utama:

- 1440x900
- 1366x768

Tetap usable di:

- 1024x768
- mobile diagnostic view

---

# 34. Table UX

Semua tabel penting harus mendukung:

- search
- filter
- sorting
- pagination
- date range
- status filter
- loading state
- empty state
- error state

Gunakan server pagination untuk dataset besar.

---

# 35. Global Search

Search dapat mencari:

- Organization Name
- Customer Email
- User Name
- Transaction Reference
- Provider Payment ID

Jangan index isi dokumen confidential.

---

# 36. Admin Notes

Internal notes dapat ditambahkan ke:

- Organization
- Subscription
- Payment
- Support Case

Fields:

- author
- timestamp
- content

Tidak terlihat tenant.

---

# 37. Analytics Rules

- Revenue hanya dari authoritative paid transactions.
- One organization = one paying organization, meskipun punya banyak users.
- Pisahkan User, Organization, Paying Organization.
- Jangan double count transaction.
- Gunakan timezone display `Asia/Jakarta`.
- Store timestamp database konsisten (prefer UTC).

---

# 38. Non-Functional Requirements

## Performance

- Hindari N+1 queries.
- Gunakan index untuk field sering difilter.
- Server pagination.
- Query agregasi yang efisien.

## Security

- RLS tetap aktif.
- Cross-tenant leakage = P0 blocker.
- Superadmin authorization server-side.
- Password/secret tidak terekspos.

## Reliability

- Tidak ada fake success state.
- Empty state jujur.
- System health hanya berdasarkan telemetry nyata.

## Auditability

- Semua manual correction penting dicatat.

---

# 39. Acceptance Criteria

Sistem dinyatakan selesai hanya jika:

- Superadmin Auth: PASS
- Hanya `bungradjen@gmail.com`: PASS
- Tenant Owner denied: PASS
- Direct API unauthorized denied: PASS
- Dashboard real data: PASS
- Attention Center: PASS
- Organizations: PASS
- Users: PASS
- Subscriptions: PASS
- Transactions: PASS
- Unclaimed Payments: PASS
- Webhook Events: PASS
- Reconciliation: PASS
- Renewal Operations: PASS
- Customer Health: PASS
- Customer Lifecycle: PASS
- Usage: PASS
- Feedback: PASS
- Support: PASS
- System Health: PASS
- Audit Logs: PASS
- RLS Security: PASS
- Cross-Tenant Isolation: PASS
- Privacy: PASS
- Typecheck: PASS
- Build: PASS
- Automated Tests: PASS
- Browser E2E: PASS
- Regression: PASS

---

# 40. Definition of Done

Status akhir hanya boleh:

`NOTARYGO SUPERADMIN: PRODUCTION READY`

jika seluruh critical acceptance pass.

Jika ada blocker:

`NOTARYGO SUPERADMIN: NO-GO`

sertakan:

- blocker
- severity
- root cause
- affected file
- required fix
- retest result
