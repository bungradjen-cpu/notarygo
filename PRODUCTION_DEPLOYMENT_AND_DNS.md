# NOTARYGO™ — Production Deployment & DNS Guide

This runbook provides the exact steps to deploy NotaryGo SaaS to production using **Supabase** (Database, Auth, Storage) and **Vercel** (Next.js Application & Edge).

---

## 1. Production Architecture Overview

- **`www.<domain>`** (e.g. `www.notarygo.com`): Marketing / Landing Page
- **`app.<domain>`** (e.g. `app.notarygo.com`): SaaS Application, Auth & Dashboard
- **Database & Auth**: Supabase Managed PostgreSQL
- **Storage**: Supabase Storage (`documents` private bucket)
- **Billing**: Mayar.id Production API + Webhook

---

## 2. Supabase Production Setup

### Step 2.1: Run Migrations
In the Supabase SQL Editor for your production project, execute the migrations in chronological order from `saas-app/supabase/migrations/`:

1. `0001_initial_schema.sql` (Profiles, Organizations, Members, Subscriptions)
2. `0002_fix_rls.sql` (Strict tenant isolation functions)
3. `0003_storage.sql` (Private storage bucket and RLS policies)
4. `0004_core_operations.sql` (Matters, Tasks, Clients, Activity Logs, Checklists)
5. `0005_operational_billing.sql` (Invoices, Payments, Receipts, Auto-calculation triggers)
6. `0006_billing_provider_ids.sql` (Subscription billing provider mappings & events)
7. `0007_notifications.sql` (In-App notifications, preferences, deduplication logs)
8. `0008_platform_admin.sql` (Platform admin identity, isolation, audit trail)
9. `0009_migration_batches.sql` (Legacy GAS migration tooling & idempotency)

### Step 2.2: Verify Storage Buckets
1. Go to **Storage** in Supabase Dashboard.
2. Confirm the bucket `documents` exists and is set to **Private** (Public: `false`).

### Step 2.3: Configure Supabase Auth URLs
In **Authentication** → **URL Configuration**:
- **Site URL**: `https://app.notarygo.com`
- **Redirect URLs**:
  - `https://app.notarygo.com/auth/callback`
  - `https://app.notarygo.com/auth/reset-password`
  - `https://app.notarygo.com/dashboard`

---

## 3. Vercel Deployment Setup

### Step 3.1: Connect Repository
1. Import your GitHub / GitLab repository in Vercel.
2. Set **Root Directory** to `saas-app`.
3. Framework Preset: **Next.js**.

### Step 3.2: Configure Environment Variables
Add the following in Vercel Project Settings → **Environment Variables** (Production):

| Key | Example Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Production mode |
| `NEXT_PUBLIC_APP_URL` | `https://app.notarygo.com` | Canonical SaaS application URL |
| `NEXT_PUBLIC_MARKETING_URL` | `https://www.notarygo.com` | Marketing site URL |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xyz.supabase.co` | Production Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` | Supabase Anon Key |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGci...` | Supabase Service Role Key (Secret) |
| `MAYAR_API_KEY` | `live_api_key_...` | Production Mayar API Key |
| `MAYAR_WEBHOOK_SECRET` | `live_whsec_...` | Production Mayar Webhook Secret |
| `RESEND_API_KEY` | `re_live_...` | Production Resend API Key |

---

## 4. Exact DNS Records Guide

Add the following DNS records at your Domain Registrar / DNS Provider (Cloudflare, Niagahoster, Namecheap, Route53, etc.):

### Record 1: Apex Domain Redirect
| Type | Name / Host | Value / Target | TTL |
| :--- | :--- | :--- | :--- |
| `A` | `@` (or `notarygo.com`) | `76.76.21.21` | Auto / 300 |

### Record 2: Marketing Subdomain
| Type | Name / Host | Value / Target | TTL |
| :--- | :--- | :--- | :--- |
| `CNAME` | `www` | `cname.vercel-dns.com` | Auto / 300 |

### Record 3: Application Subdomain
| Type | Name / Host | Value / Target | TTL |
| :--- | :--- | :--- | :--- |
| `CNAME` | `app` | `cname.vercel-dns.com` | Auto / 300 |

*Note: In Vercel Project Settings → **Domains**, add both `www.notarygo.com` and `app.notarygo.com`.*

---

## 5. Mayar.id Payment Webhook Configuration

1. Log in to your **Mayar.id Production Dashboard**.
2. Go to **Settings** → **API & Integration** → **Webhooks**.
3. Set Webhook URL to:  
   `https://app.notarygo.com/api/webhooks/mayar`
4. Select events:
   - `payment.received` / `payment.succeeded`
   - `subscription.created`
   - `subscription.activated`
   - `subscription.renewed`
   - `subscription.payment_failed`
   - `subscription.cancelled`
5. Copy the generated **Webhook Secret** and ensure it matches `MAYAR_WEBHOOK_SECRET` in Vercel.

---

## 6. Production Smoke Test Checklist

After DNS propagation and SSL certificate issuance:

- [ ] **HTTPS / SSL**: Navigate to `https://app.notarygo.com` and verify the SSL padlock.
- [ ] **Sign Up / Login**: Register a test organization owner and verify email confirmation redirect to `https://app.notarygo.com/auth/callback`.
- [ ] **Operational Flow**: Create a client, create a matter, add a task, upload a document.
- [ ] **Storage Security**: Verify document download uses temporary signed URLs (`/storage/v1/object/sign/...`).
- [ ] **Webhook Endpoint**: Trigger a test ping from Mayar dashboard and verify `200 OK` response.
