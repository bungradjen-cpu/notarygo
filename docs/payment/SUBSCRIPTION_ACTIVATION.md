# NOTARYGO™ SUBSCRIPTION ACTIVATION & EXTENSION RULES
**Document Version:** 1.0.0  
**Target:** Subscription Lifecycle & Entitlement Service  

---

## 1. Subscription Lifecycle States
NOTARYGO™ uses the following subscription states:
- `TRIALING`: Initial trial window (if granted).
- `ACTIVE`: Fully paid and authorized access to all operational modules.
- `PAST_DUE`: Payment failed or grace period pending.
- `EXPIRED`: Period has ended without payment; dashboard is locked with `SubscriptionLockGate`.
- `CANCELLED`: Subscription cancelled by owner or platform admin.
- `SUSPENDED`: Access frozen by platform admin for policy or administrative reasons.

---

## 2. Calendar Month Arithmetic Rules
When activating or extending a subscription, duration is calculated using calendar month additions rather than day approximations:
- **Paket 1 Bulan (`NOTARYGO_MONTHLY`):** `start.setMonth(start.getMonth() + 1)`
- **Paket 3 Bulan (`NOTARYGO_QUARTERLY`):** `start.setMonth(start.getMonth() + 3)`
- **Paket 1 Tahun (`NOTARYGO_ANNUAL`):** `start.setMonth(start.getMonth() + 12)`

### Renewal Extension Policy:
1. **Active Subscription Renewal:**
   If the organization already has an `ACTIVE` subscription and `current_period_end` is in the future, the new duration is added to `current_period_end` (seamless continuation without losing remaining paid days).
2. **Expired Subscription Renewal:**
   If the subscription is `EXPIRED` or `CANCELLED`, the new duration starts from the timestamp of the successful payment.

---

## 3. Entitlement Grants
Upon `subscriptions.status = 'ACTIVE'`, `EntitlementService` unlocks:
- Register Perkara & Berkas Akta Tanpa Batas (`max_active_matters: -1`)
- Checklist Dokumen Kelengkapan Para Pihak
- Jadwal Penandatanganan (Signing Readiness)
- Document Center & PDF Engine
- Invoicing Honorarium & Kuitansi Resmi
- Kolaborasi Staf & Supervisor
- Platform Backups & Audit Trail
