# MASTER PROMPT ANTIGRAVITY
## NOTARYGO™ SUPERADMIN - PLATFORM COMMAND CENTER
### Production Build Prompt

You are working inside the existing NOTARYGO™ SaaS repository.

Your mission is to build a production-grade **NOTARYGO™ Platform Superadmin Command Center** using the existing application architecture, Supabase database, subscription system, Mayar payment integration, and real tenant data.

Do NOT create a disconnected prototype.

Do NOT rebuild the tenant application.

Do NOT stop at UI mockups.

---

# ROLE

Act simultaneously as:

- Principal SaaS Architect
- Senior Next.js Engineer
- Senior TypeScript Engineer
- Supabase/PostgreSQL Architect
- Supabase Auth Engineer
- RLS Security Engineer
- SaaS Billing Architect
- Mayar Integration Engineer
- Platform Operations Engineer
- Product Analytics Engineer
- Customer Success Systems Architect
- QA Automation Engineer
- Security Engineer
- Enterprise Admin UX Engineer

---

# 0. SOURCE OF TRUTH

Before coding, read these project documents if present:

1. `01_PRD_NOTARYGO_SUPERADMIN.md`
2. `02_ERD_NOTARYGO_SUPERADMIN.md`
3. existing NOTARYGO PRD
4. existing Supabase migrations
5. existing subscription/payment implementation
6. existing Mayar integration
7. existing RLS policies
8. existing route structure

Functional source of truth is the REAL existing NOTARYGO codebase and database schema.

The PRD/ERD define target behavior, but you must adapt implementation to the existing architecture rather than duplicate concepts.

---

# 1. PRODUCT CONTEXT

NOTARYGO™ is a multi-tenant B2B SaaS for Indonesian Notary & PPAT offices.

Core tenant roles:

- OWNER
- ADMIN
- SUPERVISOR
- STAFF
- FINANCE

Superadmin is a completely separate platform security domain.

---

# 2. SINGLE SUPERADMIN POLICY

There is exactly ONE authorized Platform Superadmin:

`bungradjen@gmail.com`

Role:

`PLATFORM_SUPERADMIN`

No other platform admin role may be created.

Do NOT implement:

- BILLING_ADMIN
- SUPPORT_ADMIN
- TECH_ADMIN
- SECONDARY_SUPERADMIN
- Admin Users management
- invite platform admin
- create platform admin
- promote tenant user to platform admin from UI

No tenant OWNER automatically gains Superadmin access.

---

# 3. BOOTSTRAP CREDENTIAL

The project owner has supplied an initial password separately for bootstrap.

Security rule:

The password may only be used to provision/authenticate the Supabase Auth identity if authorized tooling is available.

NEVER:

- hardcode the password;
- place it in source code;
- put it in SQL migration;
- put it in `.env.example`;
- expose it in browser code;
- log it;
- include it in documentation;
- commit it.

If the auth user already exists, reuse it.

If secure programmatic provisioning is unavailable, mark only the provisioning step as `BLOCKED` and state the exact one-time manual Supabase action required.

Do NOT weaken security.

---

# 4. AUTHORIZATION DESIGN

Implement or reuse:

`platform_admins`

with a single authorized active record for the Superadmin identity.

Authorization must satisfy BOTH:

1. authenticated Supabase user normalized email equals `bungradjen@gmail.com`;
2. server-side `platform_admins` record exists with role `PLATFORM_SUPERADMIN` and status `ACTIVE`.

Create a shared server-side authorization helper, conceptually:

`requireSuperadmin()`

It must:

1. obtain authenticated Supabase user;
2. reject anonymous user;
3. normalize email;
4. verify exact authorized email;
5. verify platform admin record;
6. verify active role;
7. return trusted admin context;
8. otherwise 403.

Never use client-side email checks as the actual security boundary.

Never use browser-editable metadata as platform authorization truth.

---

# 5. ROUTE PROTECTION

Protect all:

`/superadmin/*`

and all platform server actions/API routes.

Examples:

`/api/superadmin/*`

Unauthorized:

- OWNER
- ADMIN
- SUPERVISOR
- STAFF
- FINANCE
- any other authenticated user
- anonymous visitor

must be denied server-side.

Direct API calls must also fail.

---

# 6. NO TRIAL

NOTARYGO has no trial.

Do NOT implement:

- TRIALING
- Free Trial
- Trial Conversion
- Trial Expiry
- Trial KPI

Customer lifecycle:

```text
CHECKOUT_STARTED
→ PAYMENT_PENDING
→ PAID
→ PAID_UNCLAIMED
→ REGISTERED
→ OFFICE_CREATED
→ ONBOARDING
→ ACTIVATED
→ ACTIVE_CUSTOMER
→ EXPIRING_SOON
→ RENEWED
```

or:

`EXPIRING_SOON → EXPIRED`

---

# 7. CURRENT PRICING

Canonical plans:

- NOTARYGO_MONTHLY - 1 Bulan - Rp129.000
- NOTARYGO_QUARTERLY - 3 Bulan - Rp249.000
- NOTARYGO_ANNUAL - 1 Tahun - Rp499.000

Annual = BEST VALUE.

Do not invent feature differences between duration plans unless the existing entitlement configuration explicitly contains them.

---

# 8. PHASE 0 - FULL REPOSITORY AUDIT

Before coding, scan the entire repository.

Find:

- auth
- profiles
- organizations
- organization_members
- subscription_plans
- plan_entitlements
- subscriptions
- billing_transactions
- payments
- Mayar routes
- webhook routes
- subscription_events
- onboarding
- analytics
- activity logs
- support
- feedback
- storage
- error monitoring
- RLS policies
- admin-related code

Classify each target concept:

- KEEP
- EXTEND
- REFACTOR
- MISSING

Create:

`docs/superadmin/SUPERADMIN_EXISTING_SYSTEM_AUDIT.md`

Do not create duplicate tables if equivalent concepts already exist.

---

# 9. DATABASE IMPLEMENTATION

Use `02_ERD_NOTARYGO_SUPERADMIN.md` as target logical model.

Important:

- adapt to existing names;
- migrations must be additive;
- no production reset;
- no global RLS disable;
- no destructive schema rewrite;
- preserve tenant data;
- preserve billing history;
- preserve webhook history;
- preserve audit history.

Create Supabase migrations only where genuinely necessary.

---

# 10. SUPERADMIN SHELL

Create dedicated shell:

`/superadmin`

Desktop-first.

Navigation:

```text
OVERVIEW
Dashboard
Attention Center
SaaS Metrics

CUSTOMERS
Organizations
Users & Membership
Customer Health
Customer Lifecycle
Support
Feedback & Feature Requests

BILLING & SUBSCRIPTION
Subscriptions
Transactions
Unclaimed Payments
Webhook Events
Reconciliation Queue
Renewal Operations
Refunds

PRODUCT
Usage & Adoption
Feature Usage
Plans & Entitlements

SYSTEM
System Health
Errors & Incidents
Email Delivery
Storage Usage
Audit Logs

SETTINGS
Payment Provider
Platform Configuration
```

Do not add `Admin Users`.

---

# 11. DESIGN SYSTEM

Use NOTARYGO palette:

- Notary Navy `#0B1F4D`
- Deep Navy `#07152F`
- Notary Gold `#E89A0C`
- Warm Gold `#F4B341`
- Cloud White `#F8FAFC`
- White `#FFFFFF`
- Text Primary `#10213D`
- Text Secondary `#64748B`
- Border `#E2E8F0`
- Success `#059669`
- Warning `#D97706`
- Critical `#DC2626`

Design principle:

**CONTROL CENTER, NOT DECORATIVE DASHBOARD.**

UI must feel:

- enterprise
- operational
- trustworthy
- dense but readable
- fast
- attention-first

Avoid:

- neon
- excessive gradients
- glassmorphism
- unnecessary animation
- marketing-style oversized sections

---

# 12. DASHBOARD

Route:

`/superadmin`

Build with REAL data.

Primary KPI:

- Revenue This Month
- Active Subscriptions
- New Paying Customers
- Active Offices
- Renewal Rate
- Payment Success Rate

Secondary KPI:

- Total Organizations
- Activated Organizations
- At Risk
- Unclaimed Payments
- Expiring Soon
- Critical Incidents

Include:

- Attention Required
- Activation Funnel
- Subscription Expiry
- Customer Health
- Recent Payments
- Recent Signups
- System Health

Every KPI should drill down to an actionable filtered view where appropriate.

---

# 13. FINANCIAL METRIC CORRECTNESS

Revenue must come from authoritative verified paid transactions.

Do not count:

- pending payment;
- failed payment;
- duplicate webhook;
- test records in production metrics.

Prevent duplicate counting.

One organization with multiple users is still one paying organization.

Clearly distinguish:

- Users
- Organizations
- Paying Organizations

Do not fabricate accounting MRR if prepaid revenue logic cannot support it.

If displaying monthly-equivalent recurring value, label it precisely.

---

# 14. ATTENTION CENTER

Route:

`/superadmin/attention`

Aggregate actionable abnormalities:

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

Severity:

- CRITICAL
- HIGH
- MEDIUM
- LOW

Each item needs:

- type
- severity
- organization/customer
- reference
- detected time
- reason
- recommended action
- current status

---

# 15. ORGANIZATIONS

Route:

`/superadmin/organizations`

Columns:

- Organization
- Owner
- Owner Email
- Plan
- Subscription Status
- Start
- End
- Days Remaining
- Members
- Active Matters
- Storage
- Last Activity
- Onboarding
- Customer Health
- Created At

Filters:

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

Organization detail tabs:

- Overview
- Subscription
- Usage
- Members
- Billing
- Health
- Support
- Activity

Do not expose raw document content by default.

---

# 16. USERS & MEMBERSHIP

Route:

`/superadmin/users`

Columns:

- Name
- Email
- Organization
- Role
- Account Status
- Email Verified
- Created
- Last Login

Search:

- name
- email
- office

Never expose password.

---

# 17. SUBSCRIPTIONS

Route:

`/superadmin/subscriptions`

Display:

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
- Controlled Suspend
- Controlled Reactivation

Never create a casual free-form status dropdown.

Manual override requires reason and immutable audit log.

---

# 18. TRANSACTIONS

Route:

`/superadmin/transactions`

Display:

- Internal Reference
- Customer
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
- Claim Status

Use actual schema/status values.

---

# 19. UNCLAIMED PAYMENTS

Route:

`/superadmin/unclaimed-payments`

This is critical.

Flow:

`PAID → NO ACCOUNT → UNCLAIMED → SAME VERIFIED EMAIL SIGNUP → CLAIMED → SUBSCRIPTION ACTIVE`

Display:

- Email
- Customer Name
- Plan
- Amount
- Paid At
- Days Since Payment
- Account Exists
- Organization Exists
- Claim Status

Safe actions:

- View Payment
- Check Account
- Copy Signup Instruction
- Mark Contacted
- Add Note

Do NOT allow manual fake PAID state.

---

# 20. WEBHOOK EVENTS

Route:

`/superadmin/webhooks`

Display:

- Provider Event ID
- Event Type
- Transaction
- Provider Payment ID
- Received
- Processed
- Status
- Retry Count
- Sanitized Error

Status:

- PROCESSED
- DUPLICATE
- INVALID
- FAILED
- IGNORED
- NEEDS_REVIEW

Metrics:

- success rate
- received 24h
- failed 24h
- last success
- last failure

Never expose webhook secret.

---

# 21. RECONCILIATION QUEUE

Route:

`/superadmin/reconciliation`

Detect mismatches:

- provider paid / internal pending
- internal paid / subscription inactive
- claimed payment / no organization
- entitlement mismatch

Actions:

- inspect
- safe retry
- resolve with note

Every action audited.

Reconciliation must be idempotent.

---

# 22. RENEWAL OPERATIONS

Route:

`/superadmin/renewals`

Queues:

- Expiring Today
- 7 Days
- 14 Days
- 30 Days
- Expired 1-7 Days
- Expired 8-30 Days

Display:

- Organization
- Owner
- Email
- Phone
- Plan
- End Date
- Last Activity
- Health
- Renewal Status
- Contact Status

Contact status:

- NOT_CONTACTED
- REMINDER_SENT
- WHATSAPP_SENT
- INTERESTED
- RENEWED
- NO_RESPONSE
- DECLINED

---

# 23. REFUNDS

Implement only if current Mayar/provider workflow supports it.

Never display fake provider success.

If unsupported, build read-only/request-tracking layer or mark provider execution as unsupported.

---

# 24. CUSTOMER HEALTH

Route:

`/superadmin/customer-health`

Status:

- HEALTHY
- WATCH
- AT_RISK

Use transparent rule-based signals initially.

Signals may include:

- subscription
- days to expiry
- last login
- onboarding
- first matter
- staff invite
- document upload
- usage recency
- support issue
- payment issue

Do not create opaque AI scoring.

---

# 25. CUSTOMER LIFECYCLE

Route:

`/superadmin/customer-lifecycle`

Show counts, conversion and drop-off across actual lifecycle stages.

Do not fabricate unsupported lifecycle data.

---

# 26. USAGE & ADOPTION

Route:

`/superadmin/usage`

Metrics:

- Organizations Active 7D/30D
- Users Active 7D/30D
- Matters Created
- Tasks Created
- Documents Uploaded
- PDFs Generated
- Invoices Created
- Staff Invited
- Onboarding Completed

Use real events/data.

---

# 27. FEATURE USAGE

Route:

`/superadmin/usage/features`

Track adoption by organization for:

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

Do not store private document body in analytics.

---

# 28. SUPPORT

Route:

`/superadmin/support`

Status:

- OPEN
- IN_PROGRESS
- WAITING_CUSTOMER
- RESOLVED
- CLOSED

Category:

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

Because there is a single Superadmin, assigned admin is always the current authorized Superadmin or nullable/unassigned.

---

# 29. FEEDBACK & FEATURE REQUEST

Route:

`/superadmin/feedback`

Support customer prompt:

`Fitur apa yang Anda harapkan untuk aplikasi ini?`

Categories:

- BUG
- IMPROVEMENT
- FEATURE_REQUEST
- COMPLAINT
- GENERAL_FEEDBACK

Internal status:

- REQUESTED
- UNDER_REVIEW
- PLANNED
- IN_DEVELOPMENT
- RELEASED
- REJECTED

Allow grouping similar feature requests and counting unique organizations requesting them.

---

# 30. PLANS & ENTITLEMENTS

Route:

`/superadmin/plans`

Show current plans, prices, duration, active state and entitlements.

Do not expose a casual UI that can accidentally alter production pricing unless existing product policy requires edit capability.

If editing is allowed:

- require confirmation;
- audit before/after;
- validate amount;
- do not retroactively rewrite historical transactions.

---

# 31. SYSTEM HEALTH

Route:

`/superadmin/system`

Services:

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

Never fake health status.

---

# 32. ERRORS & INCIDENTS

Route:

`/superadmin/errors`

Store/display only sanitized diagnostic metadata.

Never expose:

- passwords
- auth tokens
- Mayar API key
- webhook secret
- Supabase service role
- confidential document contents

---

# 33. EMAIL DELIVERY

Route:

`/superadmin/email`

If provider gives delivery data, show:

- Sent
- Delivered
- Failed
- Bounced
- Pending

Otherwise show only available signals.

Never invent metrics.

---

# 34. STORAGE

Route:

`/superadmin/storage`

Show organization-level usage only:

- storage bytes
- document count
- quota
- usage %
- last upload

Warnings:

- 80%
- 90%
- 100%

Do not provide routine document-content browsing.

---

# 35. AUDIT LOG

Route:

`/superadmin/audit`

Create/reuse immutable platform audit log.

Audit:

- ADMIN_LOGIN
- SUBSCRIPTION_OVERRIDE
- SUBSCRIPTION_SUSPENDED
- SUBSCRIPTION_REACTIVATED
- PAYMENT_RECONCILED
- REFUND_ACTION
- TENANT_STATUS_CHANGED
- SUPPORT_ACCESS
- CONFIG_CHANGED

Normal UI cannot edit/delete audit records.

---

# 36. SETTINGS - MAYAR

Route:

`/superadmin/settings/payment-provider`

Show safe status only:

- provider name
- sandbox/production
- API configured/missing
- webhook configured/missing
- last webhook success
- last webhook failure

Never render secrets.

---

# 37. PLATFORM CONFIGURATION

Route:

`/superadmin/settings/platform`

Manage only safe settings such as:

- renewal thresholds
- inactivity threshold
- customer-health thresholds
- attention thresholds

Audit changes.

Do not expose security-critical secrets.

---

# 38. TABLE & SEARCH UX

Important tables need:

- search
- filter
- sorting
- pagination
- date range
- loading
- empty state
- error state

Global search:

- Organization Name
- Customer Email
- User Name
- Internal Transaction Reference
- Provider Payment ID

Do not index confidential document bodies.

---

# 39. ADMIN NOTES

Support internal notes on:

- Organization
- Subscription
- Payment
- Support Ticket

Notes are private to platform and not visible to tenant users.

---

# 40. PERFORMANCE

Avoid N+1 queries.

Add indexes for frequently filtered columns if missing.

Use server pagination.

Use efficient aggregations.

Do not load all transactions/users into browser.

---

# 41. RLS & DATA ACCESS

Do NOT disable RLS.

Tenant users must never gain access to:

- all organizations
- all users
- all transactions
- platform admin record
- reconciliation queue
- platform audit log
- system incidents
- platform settings

Use trusted server-side Supabase access only after `requireSuperadmin()`.

Cross-tenant data leakage = P0 RELEASE BLOCKER.

---

# 42. PRIVACY

Superadmin controls the PLATFORM, not customer confidential content.

By default, do not expose:

- uploaded document body
- notarial deed content
- customer client-document contents
- passwords
- auth tokens
- provider secrets

If diagnostic support requires sensitive access in the future, it must be separately designed, explicit and audited. Do not create it now unless already required by existing system.

---

# 43. TIMEZONE

Store timestamps using existing DB convention, preferably UTC.

Display operational dates in:

`Asia/Jakarta`

unless project already has another explicit standard.

---

# 44. NO FAKE DATA

No production mock/demo rows.

No fake healthy status.

No fake payment success.

No fabricated revenue.

No fabricated provider response.

If data is unavailable, show truthful empty/unknown/not-monitored state.

---

# 45. REQUIRED TESTS - AUTH

Test A:

Login with authorized Superadmin identity.

Expected:

`/superadmin` ALLOWED.

Test B:

Normal OWNER.

Expected 403.

Test C:

ADMIN / SUPERVISOR / STAFF / FINANCE.

Expected 403.

Test D:

Authenticated non-authorized user directly calls `/api/superadmin/*`.

Expected 403.

Test E:

Client edits local state/metadata to pretend Superadmin.

Expected 403.

Test F:

Authorized email but platform_admin record missing/inactive in controlled test environment.

Expected denied.

---

# 46. REQUIRED TESTS - BILLING

- paid transaction counted once
- pending not counted as revenue
- failed not counted
- duplicate webhook not double-counted
- unclaimed payment appears
- claimed payment leaves unresolved queue
- paid but subscription inactive creates attention item
- reconciliation fixes once, idempotently
- expiry filters correct

---

# 47. REQUIRED TESTS - PRIVACY

Verify Superadmin UI does NOT expose:

- password
- API key
- webhook secret
- service-role key
- raw confidential documents

---

# 48. BROWSER E2E

Use Playwright or existing E2E framework.

Test at minimum:

1. Superadmin login
2. Dashboard
3. Organizations search/detail
4. Users
5. Subscriptions filter/detail
6. Transactions
7. Unclaimed payments
8. Webhook events
9. Reconciliation
10. Renewal operations
11. Customer health
12. Feedback
13. System health
14. Audit logs
15. Settings
16. unauthorized tenant access

Test viewport:

- 1440x900
- 1366x768
- 1024x768
- mobile width

---

# 49. REGRESSION

After Superadmin implementation, verify tenant app still works:

- Signup
- Login
- Organization
- Subscription
- Team
- Dashboard
- Matter
- Clients
- Partners
- Tasks
- Documents
- Operational Billing
- Payment
- PDF
- Settings
- Mayar
- Webhook

Superadmin must not break existing NOTARYGO functionality.

---

# 50. REQUIRED DOCUMENTATION

Create:

- `docs/superadmin/SUPERADMIN_EXISTING_SYSTEM_AUDIT.md`
- `docs/superadmin/SUPERADMIN_ARCHITECTURE.md`
- `docs/superadmin/SUPERADMIN_DATABASE.md`
- `docs/superadmin/SUPERADMIN_SECURITY.md`
- `docs/superadmin/SUPERADMIN_METRICS_DEFINITIONS.md`
- `docs/superadmin/SUPERADMIN_OPERATION_GUIDE.md`
- `docs/superadmin/SUPERADMIN_TEST_REPORT.md`
- `docs/superadmin/SUPERADMIN_ACCEPTANCE.md`

Never include the bootstrap password in generated documentation.

---

# 51. IMPLEMENTATION ORDER

Execute sequentially:

PHASE 0 - Repository audit
PHASE 1 - DB/security design reconciliation with existing schema
PHASE 2 - Platform admin mapping/migration
PHASE 3 - Secure Superadmin authorization helper
PHASE 4 - Superadmin shell/navigation/design system
PHASE 5 - Dashboard
PHASE 6 - Attention Center
PHASE 7 - Organizations
PHASE 8 - Users
PHASE 9 - Subscriptions
PHASE 10 - Transactions
PHASE 11 - Unclaimed Payments
PHASE 12 - Webhook Events
PHASE 13 - Reconciliation
PHASE 14 - Renewal Operations
PHASE 15 - Customer Health
PHASE 16 - Customer Lifecycle
PHASE 17 - Usage & Adoption
PHASE 18 - Feature Usage
PHASE 19 - Support
PHASE 20 - Feedback
PHASE 21 - Plans & Entitlements
PHASE 22 - System Health
PHASE 23 - Errors/Email/Storage
PHASE 24 - Audit Logs
PHASE 25 - Settings
PHASE 26 - Automated tests
PHASE 27 - Browser E2E
PHASE 28 - Regression
PHASE 29 - Production acceptance

Do not perform one uncontrolled giant rewrite.

---

# 52. MVP PRIORITY

If the full scope is too large for one safe implementation iteration, complete this critical MVP first without weakening security:

1. Superadmin Auth/Authorization
2. Dashboard
3. Attention Center
4. Organizations
5. Users
6. Subscriptions
7. Transactions
8. Unclaimed Payments
9. Webhook Events
10. Reconciliation
11. Renewal Operations
12. System Health
13. Audit Logs

Then continue remaining modules.

Do not stop because MVP is done if the environment permits continuing.

---

# 53. ACCEPTANCE TABLE

Create final acceptance table:

```text
SINGLE SUPERADMIN POLICY: PASS / FAIL
SUPERADMIN AUTH: PASS / FAIL
SERVER AUTHORIZATION: PASS / FAIL
TENANT ACCESS DENIAL: PASS / FAIL
DIRECT API DENIAL: PASS / FAIL

DASHBOARD: PASS / FAIL
ATTENTION CENTER: PASS / FAIL
ORGANIZATIONS: PASS / FAIL
USERS: PASS / FAIL
SUBSCRIPTIONS: PASS / FAIL
TRANSACTIONS: PASS / FAIL
UNCLAIMED PAYMENTS: PASS / FAIL
WEBHOOK EVENTS: PASS / FAIL
RECONCILIATION: PASS / FAIL
RENEWAL OPERATIONS: PASS / FAIL
CUSTOMER HEALTH: PASS / FAIL
CUSTOMER LIFECYCLE: PASS / FAIL
USAGE: PASS / FAIL
FEATURE USAGE: PASS / FAIL
SUPPORT: PASS / FAIL
FEEDBACK: PASS / FAIL
PLANS & ENTITLEMENTS: PASS / FAIL
SYSTEM HEALTH: PASS / FAIL
ERRORS: PASS / FAIL
EMAIL: PASS / FAIL
STORAGE: PASS / FAIL
AUDIT LOG: PASS / FAIL
SETTINGS: PASS / FAIL

RLS SECURITY: PASS / FAIL
CROSS-TENANT ISOLATION: PASS / FAIL
PRIVACY: PASS / FAIL
ANALYTICS CORRECTNESS: PASS / FAIL

TYPECHECK: PASS / FAIL
LINT: PASS / FAIL
BUILD: PASS / FAIL
AUTOMATED TESTS: PASS / FAIL
BROWSER E2E: PASS / FAIL
REGRESSION: PASS / FAIL
```

---

# 54. FINAL STATUS

Only state:

`NOTARYGO SUPERADMIN: PRODUCTION READY`

when every critical security, billing, data-isolation, build and E2E criterion has actually passed.

Otherwise state:

`NOTARYGO SUPERADMIN: NO-GO`

and provide:

- blocker
- severity
- root cause
- affected file
- required fix
- retest result

---

# 55. EXECUTION RULE

Do NOT stop after writing a plan.

Proceed through:

1. audit
2. schema reconciliation
3. migration
4. server authorization
5. implementation
6. real data integration
7. security tests
8. browser tests
9. defect fixing
10. regression
11. acceptance report

Only leave a step as `BLOCKED` when it genuinely requires an external credential, external provider dashboard action, or permission unavailable in the current environment.

Do not claim success for blocked work.

START NOW WITH PHASE 0: AUDIT THE EXISTING NOTARYGO REPOSITORY.
