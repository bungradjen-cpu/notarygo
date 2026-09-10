# NOTARYGO™ MAYAR PAYMENT ARCHITECTURE
**Document Version:** 1.0.0  
**Domain:** Platform Subscription Billing (SaaS Access)  
**Provider:** Mayar.id Gateway  

---

## 1. High-Level Architecture Diagram

```
                  NOTARYGO™
                     │
                     ▼
                PRICING PAGE
                     │
          ┌──────────┼──────────┐
          ▼          ▼          ▼
       1 Bulan    3 Bulan    1 Tahun
      Rp129K      Rp249K      Rp499K
          │          │          │
          └──────────┼──────────┘
                     ▼
             CUSTOMER DETAILS
              Nama / Email / HP
                     │
                     ▼
        NOTARYGO BACKEND/SERVER
                     │
             Validate Plan
             Validate Price
             Create Tx ID (NGPAY-...)
                     │
                     ▼
                 MAYAR API
          POST /hl/v2/payments/create
          extraData: { txId, ... }
                     │
                     ▼
              PAYMENT LINK
                     │
                     ▼
            QRIS / VA / ETC.
                     │
                Customer Pays
                     │
                     ▼
              MAYAR WEBHOOK
                     │
                     ▼
           NOTARYGO WEBHOOK API
          POST /api/webhooks/mayar
                     │
          ┌──────────┴───────────┐
          │ Verify authenticity   │
          │ Verify transaction    │
          │ Verify amount         │
          │ Verify idempotency    │
          └──────────┬───────────┘
                     ▼
                PAYMENT PAID
                     │
            ┌────────┴────────┐
            │                 │
     ACCOUNT EXISTS      NO ACCOUNT YET
            │                 │
            ▼                 ▼
     Activate/Extend       Save Paid
      Subscription         Unclaimed
            │                 │
            │                 ▼
            │            SIGNUP PAGE
            │                 │
            │         Same payment email
            │                 │
            │                 ▼
            │          Supabase Auth
            │                 │
            │                 ▼
            │          Claim Payment
            └──────────┬──────┘
                       ▼
               SUBSCRIPTION ACTIVE
                       │
                       ▼
                  ENTITLEMENTS
                       │
                       ▼
                   ONBOARDING
                       │
                       ▼
                  NOTARYGO APP
```

---

## 2. Core Architectural Principles
1. **Server-Side Price Authority**: Clients can only specify `planCode` (`NOTARYGO_MONTHLY`, `NOTARYGO_QUARTERLY`, `NOTARYGO_ANNUAL`). Price amounts are resolved server-side from `CANONICAL_PLANS`. Any client-submitted amount is ignored.
2. **Deterministic Transaction Reference**: Every payment request receives a unique identifier prefixed with `NGPAY-<timestamp>-<hex>` generated prior to invoking Mayar API.
3. **Correlation Via `extraData`**: The internal transaction ID is passed to Mayar inside `extraData: { txId: ... }`. Mayar echoes this in webhook callbacks, ensuring 100% correlation.
4. **Pay-First Signup Claiming**: Payments by prospective customers are recorded under normalized emails. Upon registration and organization creation with the same verified email, the payment is claimed atomically.
5. **Multi-Tenant Separation**: Platform subscription billing is strictly isolated from Notary office operational billing (`matter_invoices`).
