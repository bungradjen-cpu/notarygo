# MAYAR WEBHOOK SETUP & VERIFICATION GUIDE
**Target System:** NOTARYGO™ SaaS Platform  
**Endpoint:** `POST /api/webhooks/mayar`  

---

## 1. Webhook URL Registration
In your Mayar Dashboard ([mayar.id](https://mayar.id) or [mayar.club](https://mayar.club)):
1. Navigate to **Integrasi** -> **Webhook**.
2. Click **Tambah Webhook URL** / **Edit**.
3. Set the Webhook URL to:
   ```
   https://notarygo-iota.vercel.app/api/webhooks/mayar
   ```
   *(Or with query secret token fallback if preferred):*
   ```
   https://notarygo-iota.vercel.app/api/webhooks/mayar?secret=YOUR_MAYAR_WEBHOOK_SECRET
   ```
4. Select Events to listen for:
   - `payment.received` (Wajib)
   - `testing` (Opsional / untuk tombol Test URL)

---

## 2. Authentication & Security Mechanisms
NOTARYGO™ implements a multi-tier security verification for every incoming webhook request:
1. **Header Token (`x-mayar-token`)**: Verified against server-side `MAYAR_WEBHOOK_SECRET`.
2. **URL Query Secret (`?secret=...`)**: Verified against `MAYAR_WEBHOOK_SECRET` for GoBuild pattern compatibility.
3. **HMAC SHA-256 Signature (`x-mayar-signature`)**: Verified against the raw payload body when header is provided.
4. **Dashboard Ping Test (`event: testing`)**: Automatically acknowledged with status `200 OK` and success message to validate connection from Mayar dashboard.

---

## 3. Idempotency & Replay Protection
- Every transaction contains an internal reference (e.g., `NGPAY-xxx`).
- When a webhook is received, the system checks whether the transaction is already in `PAID` or `CLAIMED` status.
- Duplicate deliveries immediately return `200 OK` with reason `ALREADY_PROCESSED`, preventing:
  - Double billing
  - Duplicate subscription extensions
  - Redundant event audit entries

---

## 4. Amount Verification
The webhook handler verifies that the paid amount (`payload.data.amount`) is strictly greater than or equal to `billing_transactions.amount`. If an attacker pays a smaller amount for a higher tier, the transaction is marked `FAILED` and recorded as a security mismatch event.
