# NOTARYGO™ SaaS — SYSTEM ARCHITECTURE

## 1. High-Level Architecture Overview

NotaryGo SaaS is a B2B Multi-Tenant application designed for Notary Offices. It transitions from a monolithic Google Apps Script implementation into a modern, decoupled **Next.js (App Router) + Supabase** architecture.

### Technology Stack
- **Frontend & API**: Next.js (App Router), TypeScript, React, TailwindCSS, Shadcn UI.
- **Authentication**: Supabase Auth (PostgreSQL-backed JWT with Row-Level Security integration).
- **Database**: Supabase PostgreSQL (Relational Database with strict RLS and indexing).
- **File Storage**: Supabase Storage (S3-compatible, strictly isolated per tenant via RLS).
- **Background Jobs**: Supabase Edge Functions / `pg_cron` for scheduled tasks (reminders, billing).

## 2. Multi-Tenant Tenancy Model

NotaryGo uses a **Pool-Based (Shared Database, Shared Schema)** Multi-Tenancy model.
- **Tenant Definition**: A tenant is an `Organization` (Kantor Notaris).
- **User Definition**: A `User` (Profile) is independent of the organization and can belong to one or multiple organizations via the `organization_members` junction table.
- **Data Isolation**: All transactional tables (Clients, Matters, Tasks, Invoices) include an `org_id` (UUID) column. Cross-tenant access is strictly denied at the database engine layer using PostgreSQL **Row-Level Security (RLS)**.

## 3. Core Components

### 3.1. Supabase Auth & Profiles
- Supabase Auth manages identities via the `auth.users` schema.
- Upon signup/login, a trigger maps `auth.users` to `public.profiles`.
- Authentication uses JWT tokens. The `org_id` can be injected into the JWT claims or queried securely via helper functions to enforce RLS in real-time.

### 3.2. Subscriptions & Billing Architecture
- The application monetizes via SaaS subscription plans.
- Tied directly to `organizations` (Tenants), NOT `profiles`.
- Tables: `subscription_plans`, `plan_entitlements`, `subscriptions`.
- Ensures features (e.g., max users, API limits) are strictly gated via database lookups or signed JWT claims.

### 3.3. Document & Storage Engine
- Documents are physical files mapped to `documents` and `document_versions` inside the database.
- The actual binary files are stored in Supabase Storage buckets.
- Bucket structure follows `tenant-data/{org_id}/{matter_id}/...` enforcing physical and logical separation.

### 3.4. Audit & Activity Logging
- All critical actions (`INSERT`, `UPDATE`, `DELETE`) on operational tables are captured.
- Driven by **PostgreSQL Triggers** into the `activity_logs` table.
- Cannot be tampered with by the application layer.

## 4. API & Data Access Strategy

- **Direct Database Access**: The Next.js client uses `supabase-js` to communicate directly with PostgreSQL via PostgREST. RLS guarantees that users can only query data for organizations where they hold a valid role.
- **Server Actions / API Routes**: Used exclusively for administrative tasks, complex transactions, third-party integrations (e.g., Payment Gateway, Email Provider), or when bypassing RLS safely using a `service_role` key is explicitly required.

## 5. Security Posture
- Total reliance on Database-Level Security (RLS). No "soft-filtering" in the application layer (`WHERE org_id = ?`). If an application bug omits the `WHERE` clause, the database will inherently reject unauthorized access.
