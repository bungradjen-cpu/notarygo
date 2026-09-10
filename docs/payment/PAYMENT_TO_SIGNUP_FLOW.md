# NOTARYGO™ PAYMENT-TO-SIGNUP WORKFLOW
**Document Version:** 1.0.0  
**Feature:** Pay-First, Register-After (Pre-Signup Payment Claiming)  

---

## 1. Business Context & Objective
Prospective Notary Office clients frequently choose a subscription plan directly from marketing landing pages or pricing tables before creating an account.
NOTARYGO™ guarantees that payments made prior to account registration are never lost. When the user completes signup with the verified payment email, the subscription is automatically claimed and attached to their new organization.

---

## 2. End-to-End Sequence

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Calon Notaris
    participant Web as NOTARYGO Pricing
    participant API as /api/billing/mayar/create-payment
    participant Mayar as Mayar.id Gateway
    participant Webhook as /api/webhooks/mayar
    participant DB as Supabase PostgreSQL
    participant Auth as Supabase Auth & Signup
    participant Onboarding as /onboarding/create-org

    Customer->>Web: Pilih Paket (1 Bulan / 3 Bulan / 1 Tahun)
    Customer->>Web: Isi Nama, Email, Nomor WhatsApp
    Web->>API: POST /api/billing/mayar/create-payment
    API->>API: Validasi & Ambil Harga Kanonikal Server
    API->>API: Buat Ref NGPAY-xxx & Record MAYAR_PENDING
    API->>Mayar: POST /hl/v2/payments/create (extraData: txId)
    Mayar-->>API: Return paymentUrl
    API-->>Web: Return paymentUrl
    Web->>Customer: Buka Modal Pembayaran Mayar (QRIS / VA)
    Customer->>Mayar: Pelunasan Pembayaran
    Mayar->>Webhook: Webhook Callback (payment.received)
    Webhook->>Webhook: Verifikasi Token & Nominal
    Webhook->>DB: Update Transaksi ke PAID (UNCLAIMED)
    Customer->>Web: Redirect ke /payment/status?txId=NGPAY-xxx
    Web-->>Customer: Status "Pembayaran Berhasil! Buat Akun Anda"
    Customer->>Auth: Buka /auth/signup (Email terisi otomatis)
    Customer->>Auth: Submit Pendaftaran Akun
    Auth->>Onboarding: Redirect ke /onboarding/create-org
    Customer->>Onboarding: Isi Nama Notaris & Kantor
    Onboarding->>DB: Buat Organisasi & Profile
    Onboarding->>DB: Klaim Transaksi PAID milik Email Terverifikasi
    Onboarding->>DB: Aktifkan Subscription (Status: ACTIVE, Durasi: 1/3/12 Bulan)
    Onboarding-->>Customer: Masuk ke Dashboard dengan Akses Penuh
```

---

## 3. Email Normalization & Claim Security
1. **Email Normalization:**
   All emails are normalized using `email.toLowerCase().trim()`. Case differences (e.g. `User@Notary.Com` vs `user@notary.com`) do not prevent automatic claiming.
2. **Ownership Verification:**
   Anonymous users cannot claim transactions by simply typing an email. The user must authenticate through Supabase Auth, which verifies email control before `/onboarding/actions.ts` executes the claim.
3. **Mismatched Email Protection:**
   If a user pays with `email-a@example.com` but signs up with `email-b@example.com`, the claim will not execute and the organization remains inactive, preventing unauthorized access.
