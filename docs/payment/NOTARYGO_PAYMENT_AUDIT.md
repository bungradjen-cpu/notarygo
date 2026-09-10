# NOTARYGO™ PAYMENT SYSTEM AUDIT & CLASSIFICATION
**Document Version:** 1.0.0  
**Context:** Multi-Tenant Notary Office Operational System  
**Audit Target:** Existing Billing, Subscriptions, Entitlements, Auth, and Pricing Components

---

## 1. Existing System Components Classification

| Component / File | Current Role | Classification | Rationale & Action Plan |
| :--- | :--- | :--- | :--- |
| `public.subscription_plans` (`0002_subscriptions_and_entitlements.sql`) | Table for storing plans & prices | **EXTEND** | Table exists but currently has 0 rows seeded. We will seed canonical plans (`NOTARYGO_MONTHLY`, `NOTARYGO_QUARTERLY`, `NOTARYGO_ANNUAL`) with correct IDR pricing. |
| `public.plan_entitlements` (`0002_subscriptions_and_entitlements.sql`) | Feature limits per plan | **KEEP** | Good structure. Link limits for storage, team members, and active matters. |
| `public.subscriptions` (`0002_subscriptions_and_entitlements.sql`, `0006_billing_provider_ids.sql`) | Org subscription state | **EXTEND** | Table exists with `org_id`, `status`, `current_period_end`, `mayar_subscription_id`, `mayar_payment_link_id`. Add foreign key or relation to latest transaction. |
| `public.subscription_events` (`0002_subscriptions_and_entitlements.sql`) | Subscription audit logs | **EXTEND** | Add `transaction_id` and `provider_event_id` with unique constraint for webhook deduplication. |
| `public.billing_transactions` | Platform payment tracking | **MISSING** | Currently does not exist in schema. We create this table in `0011_platform_billing_transactions.sql` to track internal refs, provider IDs, payment amounts, and claim status. |
| `Operational Invoicing` (`0005_operational_billing.sql`) | Notary office billing to their clients | **KEEP** | Pure operational billing (`matter_invoices`, `matter_payments`). Must remain completely isolated from platform subscription billing. |
| `EntitlementService` (`src/lib/billing/EntitlementService.ts`) | RBAC and feature limits guard | **KEEP** | Checks `subscriptions` status and `plan_entitlements`. Keep as canonical source of truth for platform features. |
| `MayarAdapter` (`src/lib/billing/MayarAdapter.ts`) | Mayar API wrapper | **REFACTOR** | Currently calls customer/subscription v1 endpoints without single payment invoices. Refactor to implement verified `POST /hl/v2/payments/create` with `extraData: { txId }`. |
| `Mayar Webhook` (`src/app/api/webhooks/mayar/route.ts`) | Webhook route handler | **REFACTOR** | Needs strict token verification (`x-mayar-token` / query secret), amount verification against `billing_transactions`, and atomic activation. |
| `PricingSection` (`src/components/billing/PricingSection.tsx`) | Pricing card UI | **REFACTOR** | Replace direct static payment links with interactive customer details modal and server checkout call. |
| `MayarCheckoutModal` (`src/components/billing/MayarCheckoutModal.tsx`) | Iframe modal for payment | **REFACTOR** | Adapt to receive dynamically generated `paymentUrl` from server endpoint. |
| `SubscriptionLockGate` (`src/components/billing/SubscriptionLockGate.tsx`) | Dashboard paywall lock | **KEEP** | Displays pricing when subscription is inactive. Keep and connect with updated checkout flow. |
| `Onboarding Action` (`src/app/onboarding/actions.ts`) | Org setup after signup | **EXTEND** | Add auto-claim logic: searches `billing_transactions` for paid unclaimed payment with user's verified email and activates subscription. |

---

## 2. Distinction Between the Two Billing Domains
1. **Domain A — Operational Billing:**
   - Tables: `matter_invoices`, `matter_payments`, `matter_expenses`.
   - Purpose: Kantor Notaris menagih honorarium & biaya akta kepada klien (para pihak).
   - Never modified by Mayar subscription integration.
2. **Domain B — Platform Subscription Billing:**
   - Tables: `subscription_plans`, `subscriptions`, `billing_transactions`, `subscription_events`.
   - Purpose: Kantor Notaris membayar biaya langganan software NOTARYGO™ kepada platform NOTARYGO™.
   - Powered by Mayar Gateway.
