# GOBUILD MAYAR PAYMENT INTEGRATION AUDIT
**Document Version:** 1.0.0  
**Application Audited:** GoBuild (`functions/index.js` & payment architecture reference)  
**Target Adaptation:** NOTARYGO™ SaaS Platform Subscription Billing

---

## 1. Executive Summary & Source Files Audited
The GoBuild application integrates with Mayar.id to handle online payments using a backend cloud function/Express pattern.
- **Reference Source File:** `functions/index.js` (GoBuild Cloud Function / Express backend)
- **Primary Domain:** Pro Subscription & User Upgrades
- **Verification Basis:** Local verified production code audit of GoBuild payment system.

---

## 2. Functions & Architecture
The GoBuild implementation is structured into two core endpoints:
1. `POST /create-mayar-invoice` (or `/payments/create`): Server-side endpoint that calculates the canonical package amount, generates an internal transaction reference (`txId`), calls Mayar API v2, stores the pending payment state in the database, and returns the Mayar checkout link.
2. `POST /mayar-webhook`: Server-side endpoint receiving asynchronous payment event notifications from Mayar, verifying the webhook secret, parsing `extraData.txId`, updating the database record to success, and activating user access.

---

## 3. Mayar API Endpoint & Environment Mapping
- **API Endpoint:** `POST {baseUrl}/hl/v2/payments/create`
- **Sandbox Base URL:** `https://api.mayar.club` (detected when API key contains `sb-` or `sandbox`)
- **Production Base URL:** `https://api.mayar.id`
- **Authorization Format:** `Authorization: Bearer ${MAYAR_API_KEY}`
- **Content-Type:** `application/json`

---

## 4. Request Payload Contract (GoBuild to Mayar)
```json
{
  "name": "Customer Full Name",
  "email": "customer@example.com",
  "mobile": "081234567890",
  "amount": 499000,
  "description": "Pembelian Paket NOTARYGO_ANNUAL",
  "redirect_url": "https://notarygo-iota.vercel.app/payment/status?txId=NGPAY-xxx",
  "extraData": {
    "txId": "NGPAY-xxx",
    "planCode": "NOTARYGO_ANNUAL"
  }
}
```

### Key Request Fields:
- `name` *(string, required)*: Customer's name.
- `email` *(string, required)*: Normalized email of the paying user.
- `mobile` *(string, required)*: Indonesian phone number (minimum 10 digits, e.g. `081234567890` or `6281234567890`).
- `amount` *(integer, required)*: Canonical price in IDR determined strictly on the server.
- `description` *(string)*: Clear narrative describing the subscription package.
- `redirect_url` *(string)*: UX return page for the customer after completing checkout.
- `extraData` *(object, CRITICAL)*: Custom payload preserved by Mayar and echoed back in webhook callbacks. Contains the internal transaction ID (`txId`).

---

## 5. Response Structure (Mayar to Backend)
Successful response from `POST /hl/v2/payments/create`:
```json
{
  "statusCode": 200,
  "messages": "Payment link created successfully",
  "data": {
    "id": "inv_mayar_892348234",
    "link": "https://pay.mayar.id/pl/xxxxxx",
    "status": "UNPAID",
    "amount": 499000
  }
}
```
- **Payment Link Field:** `resJson.data.link` (or `resJson.data.url`).
- **Provider Invoice/Payment ID:** `resJson.data.id`.

---

## 6. Webhook Implementation Contract
- **Webhook Endpoint:** `POST /api/webhooks/mayar`
- **Webhook Event Name:** `payment.received` (and ping `testing`)
- **Webhook Authentication / Verification:**
  - Token Header: `req.headers["x-mayar-token"]`
  - URL Query Parameter: `req.query.secret`
  - HMAC SHA-256 Signature (when enabled): `req.headers["x-mayar-signature"]`
- **Verification Rule:** The incoming secret must strictly match the server-side `MAYAR_WEBHOOK_SECRET`.

---

## 7. Webhook Payload Structure & Transaction Matching
Incoming payload from Mayar:
```json
{
  "event": "payment.received",
  "data": {
    "id": "pay_984729124",
    "invoiceId": "inv_mayar_892348234",
    "amount": 499000,
    "status": "PAID",
    "customer": {
      "name": "Budi Santoso",
      "email": "customer@example.com",
      "mobile": "081234567890"
    },
    "extraData": {
      "txId": "NGPAY-xxx",
      "planCode": "NOTARYGO_ANNUAL"
    }
  }
}
```

### Transaction Matching Strategy:
1. **Primary Match:** `payload.data?.extraData?.txId` (matches internal transaction reference).
2. **Fallback Match:** `payload.data?.invoiceId` or `payload.data?.id` (matches provider invoice ID).
3. **Customer Email Fallback:** `payload.data?.customer?.email` (normalized lowercase & trimmed).

---

## 8. Status Lifecycle
| Lifecycle Step | GoBuild Internal Status | Mayar Status | Description |
| :--- | :--- | :--- | :--- |
| Checkout Initiated | `mayar_pending` | `UNPAID` | Invoice created on Mayar, waiting for customer |
| Customer Paid | `success` | `PAID` | Webhook verified, payment settled |
| Payment Expired | `expired` | `EXPIRED` | Invoice unpaid within Mayar validity window |
| Payment Cancelled | `cancelled` | `CANCELLED` | Customer or merchant aborted payment |

---

## 9. Security Weaknesses in GoBuild & Fixes for NOTARYGO™
1. **Query String Secret Risk in GoBuild:** GoBuild accepted `?secret=` in URL query parameters. In NOTARYGO™, we prioritize `x-mayar-token` and `x-mayar-signature` headers to avoid leaking secrets in proxy/server access logs.
2. **Missing Amount Verification in GoBuild:** GoBuild updated status to success without comparing `payload.data.amount` against expected order amount. NOTARYGO™ introduces strict amount verification against `billing_transactions.amount`.
3. **No Webhook Idempotency Check in GoBuild:** Multiple webhook deliveries could trigger redundant logic. NOTARYGO™ records `provider_event_id` with unique constraints in `subscription_events`.
4. **Weak Transaction ID in GoBuild:** GoBuild used `TX-${Date.now()}` which could collide under high concurrency. NOTARYGO™ uses `NGPAY-${crypto.randomUUID()}`.

---

## 10. Reusable Pattern vs GoBuild-Specific Logic

### ✅ What We ADAPT into NOTARYGO™:
- The verified Mayar API v2 single invoice endpoint `POST /hl/v2/payments/create`.
- The `extraData: { txId }` correlation pattern.
- The `payment.received` webhook event handler.
- The server-side canonical price resolution pattern.
- The modal/iframe checkout UX.

### ❌ What We DO NOT COPY from GoBuild:
- Do NOT use Google Cloud Functions or Express routes (use Next.js App Router API Route Handlers).
- Do NOT use Firebase Firestore (use Supabase PostgreSQL with RLS).
- Do NOT store timestamps as raw millisecond numbers (use ISO 8601 Timestamptz).
- Do NOT use simple User Upgrades (adapt to Multi-Tenant Organization Subscriptions & Entitlements).
