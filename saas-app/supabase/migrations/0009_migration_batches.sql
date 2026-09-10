-- Migration: 0009_migration_batches
-- Support for opt-in, idempotent legacy GAS data import with dry-run audit trails.

-- 1. Migration Batches Table
CREATE TABLE public.migration_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  imported_by uuid NOT NULL REFERENCES public.profiles(id),
  status text NOT NULL DEFAULT 'PENDING_VALIDATION', -- PENDING_VALIDATION, PREVIEWED, COMPLETED, FAILED
  dry_run boolean NOT NULL DEFAULT false,
  counts_summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  errors jsonb NOT NULL DEFAULT '[]'::jsonb,
  unsupported_fields jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE public.migration_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view their migration batches" ON public.migration_batches
  FOR SELECT USING (public.is_org_member(org_id));

CREATE POLICY "Org owners and admins can insert migration batches" ON public.migration_batches
  FOR INSERT WITH CHECK (public.has_org_role(org_id, 'OWNER') OR public.has_org_role(org_id, 'ADMIN'));

CREATE POLICY "Org owners and admins can update migration batches" ON public.migration_batches
  FOR UPDATE USING (public.has_org_role(org_id, 'OWNER') OR public.has_org_role(org_id, 'ADMIN'));

-- 2. Add legacy_id and import_batch_id to core entity tables for idempotency
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS legacy_id text;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS import_batch_id uuid REFERENCES public.migration_batches(id) ON DELETE SET NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_clients_org_legacy_id ON public.clients(org_id, legacy_id) WHERE legacy_id IS NOT NULL;

ALTER TABLE public.matters ADD COLUMN IF NOT EXISTS legacy_id text;
ALTER TABLE public.matters ADD COLUMN IF NOT EXISTS import_batch_id uuid REFERENCES public.migration_batches(id) ON DELETE SET NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_matters_org_legacy_id ON public.matters(org_id, legacy_id) WHERE legacy_id IS NOT NULL;

ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS legacy_id text;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS import_batch_id uuid REFERENCES public.migration_batches(id) ON DELETE SET NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_tasks_org_legacy_id ON public.tasks(org_id, legacy_id) WHERE legacy_id IS NOT NULL;

ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS legacy_id text;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS import_batch_id uuid REFERENCES public.migration_batches(id) ON DELETE SET NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_invoices_org_legacy_id ON public.invoices(org_id, legacy_id) WHERE legacy_id IS NOT NULL;

ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS legacy_id text;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS import_batch_id uuid REFERENCES public.migration_batches(id) ON DELETE SET NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_documents_org_legacy_id ON public.documents(org_id, legacy_id) WHERE legacy_id IS NOT NULL;
