# NotaryGo Platform Administration Security Model

This document outlines the security, authorization, and audit mechanisms governing the Platform Admin interface (`/admin`) of NotaryGo.

## 1. Identity & Provisioning

**Strict Separation of Identity**
Platform Admin privileges are **NOT** stored in `auth.users.raw_user_meta_data`, nor are they managed via Supabase Custom Claims. Relying on user metadata can be vulnerable if a client-side update bug occurs.

**Source of Truth**
The sole source of truth is the `public.platform_admins` table.
- A user is a Platform Admin if and only if their `profile_id` exists in this table.
- The `is_platform_admin()` Postgres function is used inside Row Level Security (RLS) policies to evaluate this securely at the database engine level.

**Seed Provisioning**
The first Platform Admin must be provisioned manually at the database level by the system administrator:
```sql
INSERT INTO public.platform_admins (profile_id) 
VALUES ('<uuid-of-the-first-admin>');
```

## 2. Data Privacy & Isolation

By default, NotaryGo utilizes strict tenant isolation (Organization ID checks). 

**What Admins CAN See (Metrics)**
Platform Admins are granted cross-tenant read access (via RLS) to non-sensitive operational data necessary for running the SaaS business:
- `organizations`
- `subscriptions` & `subscription_events`
- `matters` (metadata only: counts, statuses, etc.)
- `invoices` & `payments` (for financial aggregation)

**What Admins CANNOT See (Privacy)**
Platform Admins are explicitly excluded from RLS policies on sensitive data. A Platform Admin cannot query or view:
- `documents`
- `document_versions`
- `storage.objects` (Physical files)

## 3. Impersonation & Audit Trail

**Impersonation Principle**
If a Platform Admin needs to debug a specific tenant issue (e.g., a Notary Office reports a workflow bug), they must use the Impersonation feature.

**Audit Requirement**
Before any Impersonation session can begin, a record MUST be written to `public.platform_audit_logs`.
The log captures:
- `admin_id`: Who is doing it.
- `target_org_id`: Which tenant is being accessed.
- `reason`: The support ticket number or explicit reason for access.
- `created_at`: The exact timestamp.

Only after this log is written will the UI grant temporary, localized access to the tenant's data. This ensures full accountability for support staff.
