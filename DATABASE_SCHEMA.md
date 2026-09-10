# DATABASE SCHEMA & CONSTRAINTS

Setiap tabel di NotaryGo SaaS memiliki struktur, Foreign Key, dan Constraint yang dirancang untuk integritas relasional tinggi dan isolasi multi-tenant.

## 1. Identity & Tenancy

### `profiles`
- `id` (uuid, PK, references `auth.users` ON DELETE CASCADE)
- `email` (text, UNIQUE, NOT NULL)
- `full_name` (text, NOT NULL)
- `phone` (text)
- `avatar_url` (text)
- `created_at` (timestamptz)

### `organizations`
- `id` (uuid, PK)
- `name` (text, NOT NULL)
- `notary_name` (text, NOT NULL)
- `slug` (text, UNIQUE, NOT NULL) -- For tenant-specific URLs
- `address`, `city`, `phone`, `email`
- `created_at` (timestamptz)

### `organization_members`
- `id` (uuid, PK)
- `org_id` (uuid, FK `organizations`, ON DELETE CASCADE)
- `profile_id` (uuid, FK `profiles`, ON DELETE CASCADE)
- `role` (enum: 'OWNER', 'ADMIN', 'STAFF')
- **Constraints**: UNIQUE (`org_id`, `profile_id`)
- **Indexes**: INDEX on `org_id`, INDEX on `profile_id`

### `organization_invites`
- `id` (uuid, PK)
- `org_id` (uuid, FK `organizations`, ON DELETE CASCADE)
- `email` (text, NOT NULL)
- `role` (enum)
- `token` (text, UNIQUE)
- `expires_at` (timestamptz)

## 2. Subscription Management

### `subscription_plans`
- `id` (uuid, PK), `name` (text), `price` (numeric), `interval` (text)

### `plan_entitlements`
- `id` (uuid, PK), `plan_id` (FK), `feature_key` (text), `limit_val` (int)

### `subscriptions`
- `id` (uuid, PK)
- `org_id` (uuid, FK `organizations`, UNIQUE, ON DELETE CASCADE)
- `plan_id` (uuid, FK `subscription_plans`)
- `status` (enum: 'TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED')
- `current_period_end` (timestamptz)

## 3. CRM & Service Catalog (Tenant Bound)

Semua entitas di bawah ini wajib memiliki `org_id` dengan constraint FK ke `organizations`.

### `clients`
- `id` (uuid, PK), `org_id` (uuid, FK)
- `client_type` (enum: 'INDIVIDUAL', 'CORPORATE')
- `name` (text, NOT NULL), `identifier` (text), `email`, `phone`
- **Indexes**: INDEX (`org_id`)

### `client_intakes`
- `id` (uuid, PK), `org_id` (uuid, FK), `name`, `status`, `converted_client_id` (FK `clients`)

### `partners`
- `id` (uuid, PK), `org_id` (uuid, FK), `type`, `name`, `contact_person`

### `service_types`
- `id` (uuid, PK), `org_id` (uuid, FK), `code` (text), `name` (text)
- **Constraints**: UNIQUE (`org_id`, `code`)

## 4. Workflows & Checklists Templates

### `workflow_templates` & `workflow_steps`
- `org_id` (FK). Defines step-by-step logic.

### `checklist_templates` & `document_templates`
- `org_id` (FK). Predefined requirements for matters.

## 5. Operational Core (Matters)

### `matters`
- `id` (uuid, PK), `org_id` (uuid, FK)
- `client_id` (uuid, FK `clients`, ON DELETE RESTRICT)
- `partner_id` (uuid, FK `partners`, nullable)
- `service_type_id` (uuid, FK `service_types`)
- `matter_number` (text, NOT NULL)
- `title` (text, NOT NULL)
- `status` (enum: 'OPEN', 'IN_PROGRESS', 'WAITING', 'CLOSED', 'CANCELED')
- `pic_id` (uuid, FK `profiles`)
- **Constraints**: UNIQUE (`org_id`, `matter_number`)
- **Indexes**: INDEX (`org_id`), INDEX (`client_id`)

### `tasks`
- `id` (uuid, PK), `org_id` (uuid, FK), `matter_id` (uuid, FK `matters`, ON DELETE CASCADE)
- `title`, `description`, `status`, `assigned_to` (FK `profiles`), `deadline`

### `checklist_items`, `pending_items`, `follow_ups`
- Semuanya mereferensikan `matter_id` dengan ON DELETE CASCADE. `org_id` wajib ada.

## 6. Document Engine

### `documents`
- `id` (uuid, PK), `org_id` (uuid, FK), `matter_id` (uuid, FK `matters`, ON DELETE CASCADE)
- `title` (text), `status` (enum: 'DRAFT', 'REVIEW', 'APPROVED', 'FINAL', 'SIGNED')
- `current_version_id` (uuid, FK `document_versions`)

### `document_versions`
- `id` (uuid, PK), `document_id` (uuid, FK `documents`, ON DELETE CASCADE)
- `version_number` (int), `file_path` (text, path to Supabase Storage), `uploaded_by` (FK `profiles`)

## 7. Financial & Billing

### `invoices`
- `id` (uuid, PK), `org_id` (uuid, FK), `matter_id` (uuid, FK `matters`)
- `client_id` (uuid, FK `clients`)
- `invoice_number` (text), `issue_date`, `due_date`, `status`
- `subtotal`, `tax`, `discount`, `total`, `paid_amount`
- **Constraints**: UNIQUE (`org_id`, `invoice_number`)

### `invoice_items`
- `id` (uuid, PK), `invoice_id` (uuid, FK `invoices`, ON DELETE CASCADE), `description`, `amount`

### `payments` & `receipts`
- `id` (uuid, PK), `invoice_id` (uuid, FK `invoices`, ON DELETE RESTRICT)
- `amount` (numeric), `payment_date` (timestamptz)

## 8. Audit & Analytics

### `activity_logs`
- `id` (uuid, PK), `org_id` (uuid, FK)
- `actor_id` (uuid, FK `profiles`)
- `action` (text), `entity_type` (text), `entity_id` (uuid), `metadata` (jsonb)
- **Indexes**: INDEX (`org_id`, `created_at` DESC)
