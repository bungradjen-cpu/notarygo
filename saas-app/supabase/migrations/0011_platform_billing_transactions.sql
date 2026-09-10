-- Migration: 0011_platform_billing_transactions
-- Creates billing_transactions table, seeds canonical subscription plans,
-- enhances subscription_events with idempotency keys, and configures RLS.

-- 1. Create billing_transactions table
CREATE TABLE IF NOT EXISTS public.billing_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  normalized_email text NOT NULL,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  plan_id uuid REFERENCES public.subscription_plans(id) ON DELETE SET NULL,
  plan_code text NOT NULL,
  internal_reference text UNIQUE NOT NULL,
  provider text NOT NULL DEFAULT 'MAYAR',
  provider_payment_id text,
  provider_invoice_id text,
  provider_payment_url text,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'IDR',
  status text NOT NULL DEFAULT 'CREATED', -- 'CREATED', 'MAYAR_PENDING', 'PAID', 'FAILED', 'EXPIRED', 'CANCELLED', 'CLAIMED'
  created_at timestamptz DEFAULT now(),
  paid_at timestamptz,
  claimed_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Indexes for lightning fast lookups & matching
CREATE INDEX IF NOT EXISTS idx_billing_tx_email ON public.billing_transactions(normalized_email);
CREATE INDEX IF NOT EXISTS idx_billing_tx_ref ON public.billing_transactions(internal_reference);
CREATE INDEX IF NOT EXISTS idx_billing_tx_prov_inv ON public.billing_transactions(provider_invoice_id);
CREATE INDEX IF NOT EXISTS idx_billing_tx_prov_pay ON public.billing_transactions(provider_payment_id);
CREATE INDEX IF NOT EXISTS idx_billing_tx_status ON public.billing_transactions(status);
CREATE INDEX IF NOT EXISTS idx_billing_tx_org ON public.billing_transactions(organization_id);

-- 2. Enhance subscription_events for webhook deduplication & transaction linkage
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscription_events' AND column_name = 'transaction_id'
  ) THEN
    ALTER TABLE public.subscription_events ADD COLUMN transaction_id uuid REFERENCES public.billing_transactions(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscription_events' AND column_name = 'provider_event_id'
  ) THEN
    ALTER TABLE public.subscription_events ADD COLUMN provider_event_id text UNIQUE;
  END IF;
END $$;

-- 3. Enhance subscription_plans table if plan_code column does not exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscription_plans' AND column_name = 'code'
  ) THEN
    ALTER TABLE public.subscription_plans ADD COLUMN code text UNIQUE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscription_plans' AND column_name = 'duration_months'
  ) THEN
    ALTER TABLE public.subscription_plans ADD COLUMN duration_months int DEFAULT 1;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscription_plans' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE public.subscription_plans ADD COLUMN is_active boolean DEFAULT true;
  END IF;
END $$;

-- 4. Seed Canonical Pricing Plans
INSERT INTO public.subscription_plans (id, code, name, price, interval, duration_months, description, is_active)
VALUES 
  ('a0000001-0000-0000-0000-000000000001', 'NOTARYGO_MONTHLY', 'Paket 1 Bulan', 129000, 'month', 1, 'Solusi fleksibel untuk kantor Notaris & PPAT yang ingin akses operasional bulanan penuh.', true),
  ('a0000002-0000-0000-0000-000000000002', 'NOTARYGO_QUARTERLY', 'Paket 3 Bulan', 249000, 'quarter', 3, 'Pilihan hemat kuartalan untuk stabilitas operasional dan kendali berkas kantor Notaris.', true),
  ('a0000003-0000-0000-0000-000000000003', 'NOTARYGO_ANNUAL', 'Paket 1 Tahun', 499000, 'year', 12, 'Solusi terbaik untuk kantor Notaris & PPAT dengan efisiensi biaya maksimal sepanjang tahun.', true)
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code,
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  interval = EXCLUDED.interval,
  duration_months = EXCLUDED.duration_months,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;

-- Seed Default Entitlements for the Canonical Plans
INSERT INTO public.plan_entitlements (plan_id, feature_key, limit_val)
VALUES 
  ('a0000001-0000-0000-0000-000000000001', 'storage_limit_bytes', 10737418240), -- 10 GB
  ('a0000001-0000-0000-0000-000000000001', 'max_members', 20),
  ('a0000001-0000-0000-0000-000000000001', 'max_active_matters', -1),
  ('a0000002-0000-0000-0000-000000000002', 'storage_limit_bytes', 21474836480), -- 20 GB
  ('a0000002-0000-0000-0000-000000000002', 'max_members', 50),
  ('a0000002-0000-0000-0000-000000000002', 'max_active_matters', -1),
  ('a0000003-0000-0000-0000-000000000003', 'storage_limit_bytes', 107374182400), -- 100 GB
  ('a0000003-0000-0000-0000-000000000003', 'max_members', -1),
  ('a0000003-0000-0000-0000-000000000003', 'max_active_matters', -1)
ON CONFLICT (plan_id, feature_key) DO UPDATE SET
  limit_val = EXCLUDED.limit_val;

-- 5. Row Level Security for billing_transactions
ALTER TABLE public.billing_transactions ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own billing transactions
DROP POLICY IF EXISTS "Users can view own transactions" ON public.billing_transactions;
CREATE POLICY "Users can view own transactions" ON public.billing_transactions
  FOR SELECT USING (
    auth.uid() = user_id OR 
    (organization_id IS NOT NULL AND public.is_org_member(organization_id)) OR
    EXISTS (SELECT 1 FROM public.platform_admins WHERE profile_id = auth.uid())
  );

-- Only backend (Service Role) can insert/update billing_transactions directly
DROP POLICY IF EXISTS "Service role manages billing transactions" ON public.billing_transactions;
CREATE POLICY "Service role manages billing transactions" ON public.billing_transactions
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
