-- Migration: 0002_subscriptions_and_entitlements
-- Sets up the subscription plans, entitlements, and org subscriptions.

-- Subscription Status Enum
CREATE TYPE public.subscription_status AS ENUM (
  'TRIALING',
  'ACTIVE',
  'PAST_DUE',
  'GRACE_PERIOD',
  'CANCEL_AT_PERIOD_END',
  'CANCELLED',
  'EXPIRED',
  'SUSPENDED'
);

-- Subscription Plans Table
CREATE TABLE public.subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  interval text NOT NULL DEFAULT 'month',
  description text,
  created_at timestamptz DEFAULT now()
);

-- Plan Entitlements Table
CREATE TABLE public.plan_entitlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid REFERENCES public.subscription_plans(id) ON DELETE CASCADE,
  feature_key text NOT NULL,
  limit_val int NOT NULL DEFAULT -1, -- -1 implies unlimited, 0 implies disabled
  created_at timestamptz DEFAULT now(),
  UNIQUE(plan_id, feature_key)
);

-- Subscriptions Table
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid UNIQUE REFERENCES public.organizations(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES public.subscription_plans(id),
  status public.subscription_status NOT NULL DEFAULT 'TRIALING',
  current_period_start timestamptz DEFAULT now(),
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Subscription Events Table (Audit Log)
CREATE TABLE public.subscription_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  previous_status public.subscription_status,
  new_status public.subscription_status,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Optional Usage Counters Table for metrics that are heavy to compute dynamically
-- (e.g., storage_bytes_used, operational_billing_units)
CREATE TABLE public.usage_counters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  feature_key text NOT NULL,
  current_usage bigint NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(org_id, feature_key)
);

-- ==========================================
-- RLS Policies
-- ==========================================

-- Plans and Entitlements are globally readable by authenticated users
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view subscription plans" ON public.subscription_plans FOR SELECT USING (auth.uid() IS NOT NULL);

ALTER TABLE public.plan_entitlements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view plan entitlements" ON public.plan_entitlements FOR SELECT USING (auth.uid() IS NOT NULL);

-- Subscriptions are readable by members of the organization
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view their org subscription" ON public.subscriptions FOR SELECT USING (public.is_org_member(org_id));

-- Subscription Events are readable by owners/admins
ALTER TABLE public.subscription_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view subscription events" ON public.subscription_events FOR SELECT USING (
  public.has_org_role(org_id, 'OWNER') OR public.has_org_role(org_id, 'ADMIN')
);

-- Usage Counters are readable by members
ALTER TABLE public.usage_counters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view usage counters" ON public.usage_counters FOR SELECT USING (public.is_org_member(org_id));

-- Note: Mutations to these tables should ideally be done by Server Actions (Service Role) 
-- or restricted to Finance/Owner roles if directly interacting from client.
-- For security, we do not expose direct client mutations for subscriptions.
