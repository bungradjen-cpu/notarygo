-- Migration: 0012_superadmin_platform_schema
-- Author: Antigravity Platform SaaS Architect
-- Purpose: Additive migration establishing NOTARYGO™ Platform Superadmin Command Center tables,
--          Single Superadmin policy enforcement, idempotent webhook capturing, reconciliation,
--          renewal operations, customer support & feedback, and immutable platform audit logging.

-- 1. Extend and harden public.platform_admins
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'platform_admins' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.platform_admins ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'platform_admins' AND column_name = 'email'
  ) THEN
    ALTER TABLE public.platform_admins ADD COLUMN email text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'platform_admins' AND column_name = 'role'
  ) THEN
    ALTER TABLE public.platform_admins ADD COLUMN role text NOT NULL DEFAULT 'PLATFORM_SUPERADMIN';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'platform_admins' AND column_name = 'status'
  ) THEN
    ALTER TABLE public.platform_admins ADD COLUMN status text NOT NULL DEFAULT 'ACTIVE';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'platform_admins' AND column_name = 'last_login_at'
  ) THEN
    ALTER TABLE public.platform_admins ADD COLUMN last_login_at timestamptz;
  END IF;
END $$;

-- Enforce constraints on platform_admins
DO $$
BEGIN
  -- Populate user_id and email from profiles where available
  UPDATE public.platform_admins pa
  SET 
    user_id = COALESCE(pa.user_id, pa.profile_id),
    email = COALESCE(pa.email, (SELECT p.email FROM public.profiles p WHERE p.id = pa.profile_id), 'bungradjen@gmail.com'),
    role = 'PLATFORM_SUPERADMIN',
    status = 'ACTIVE'
  WHERE pa.email IS NULL OR pa.user_id IS NULL;
END $$;

-- Guarantee single active superadmin: bungradjen@gmail.com
INSERT INTO public.platform_admins (profile_id, user_id, email, role, status)
SELECT p.id, p.id, 'bungradjen@gmail.com', 'PLATFORM_SUPERADMIN', 'ACTIVE'
FROM public.profiles p
WHERE LOWER(p.email) = 'bungradjen@gmail.com'
ON CONFLICT (profile_id) DO UPDATE SET
  user_id = EXCLUDED.user_id,
  email = EXCLUDED.email,
  role = 'PLATFORM_SUPERADMIN',
  status = 'ACTIVE';

-- Hardened helper function: is_platform_admin()
CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.platform_admins pa
    JOIN auth.users u ON (u.id = pa.user_id OR u.id = pa.profile_id)
    WHERE u.id = auth.uid()
      AND LOWER(u.email) = 'bungradjen@gmail.com'
      AND pa.role = 'PLATFORM_SUPERADMIN'
      AND pa.status = 'ACTIVE'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Fix recursive policy on platform_admins
DROP POLICY IF EXISTS "Platform admins can view platform_admins" ON public.platform_admins;
CREATE POLICY "Platform admins can view platform_admins" ON public.platform_admins
  FOR SELECT USING (
    profile_id = auth.uid() OR user_id = auth.uid() OR public.is_platform_admin()
  );


-- 2. Enhance public.billing_transactions with claim_status
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'billing_transactions' AND column_name = 'claim_status'
  ) THEN
    ALTER TABLE public.billing_transactions ADD COLUMN claim_status text NOT NULL DEFAULT 'UNCLAIMED';
  END IF;
END $$;

UPDATE public.billing_transactions
SET claim_status = 'CLAIMED'
WHERE (organization_id IS NOT NULL OR claimed_at IS NOT NULL OR status = 'CLAIMED') AND claim_status = 'UNCLAIMED';

CREATE INDEX IF NOT EXISTS idx_billing_tx_claim_status ON public.billing_transactions(claim_status);

-- 3. Idempotent Provider Webhook Events
CREATE TABLE IF NOT EXISTS public.provider_webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL DEFAULT 'MAYAR',
  provider_event_id text,
  event_type text,
  transaction_id uuid REFERENCES public.billing_transactions(id) ON DELETE SET NULL,
  provider_payment_id text,
  received_at timestamptz DEFAULT now(),
  processed_at timestamptz,
  status text NOT NULL DEFAULT 'PROCESSED', -- PROCESSED, DUPLICATE, INVALID, FAILED, IGNORED, NEEDS_REVIEW
  retry_count integer DEFAULT 0,
  error_code text,
  error_message_sanitized text,
  payload_hash text,
  payload_sanitized jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pwe_provider_event ON public.provider_webhook_events(provider, provider_event_id);
CREATE INDEX IF NOT EXISTS idx_pwe_status ON public.provider_webhook_events(status, received_at DESC);

-- 4. Reconciliation Queue
CREATE TABLE IF NOT EXISTS public.reconciliation_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL, -- PROVIDER_PAID_INTERNAL_PENDING, PAYMENT_PAID_SUBSCRIPTION_INACTIVE, CLAIMED_WITHOUT_ORGANIZATION, ENTITLEMENT_MISMATCH
  transaction_id uuid REFERENCES public.billing_transactions(id) ON DELETE SET NULL,
  subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  webhook_event_id uuid REFERENCES public.provider_webhook_events(id) ON DELETE SET NULL,
  expected_state jsonb,
  actual_state jsonb,
  severity text NOT NULL DEFAULT 'MEDIUM', -- CRITICAL, HIGH, MEDIUM, LOW
  status text NOT NULL DEFAULT 'OPEN', -- OPEN, RETRYING, RESOLVED, IGNORED
  detected_at timestamptz DEFAULT now(),
  resolved_at timestamptz,
  resolution_note text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_recon_status_sev ON public.reconciliation_items(status, severity);

-- 5. Support Tickets
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  category text NOT NULL DEFAULT 'GENERAL', -- LOGIN, SIGNUP, PAYMENT, SUBSCRIPTION, TEAM, CLIENT, PARTNER, MATTER, DOCUMENT, BILLING, PDF, ERROR, FEATURE_REQUEST, OTHER
  priority text NOT NULL DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, CRITICAL
  status text NOT NULL DEFAULT 'OPEN', -- OPEN, IN_PROGRESS, WAITING_CUSTOMER, RESOLVED, CLOSED
  subject text NOT NULL,
  description text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status, priority);
CREATE INDEX IF NOT EXISTS idx_support_tickets_org ON public.support_tickets(organization_id);

-- 6. Feedback & Feature Requests
CREATE TABLE IF NOT EXISTS public.feedback_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  category text NOT NULL DEFAULT 'FEATURE_REQUEST', -- BUG, IMPROVEMENT, FEATURE_REQUEST, COMPLAINT, GENERAL_FEEDBACK
  message text NOT NULL,
  status text NOT NULL DEFAULT 'REQUESTED', -- REQUESTED, UNDER_REVIEW, PLANNED, IN_DEVELOPMENT, RELEASED, REJECTED
  internal_note text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_feedback_status_cat ON public.feedback_items(status, category);

CREATE TABLE IF NOT EXISTS public.feature_request_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  normalized_key text UNIQUE NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'UNDER_REVIEW',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.feature_request_group_items (
  feature_request_group_id uuid REFERENCES public.feature_request_groups(id) ON DELETE CASCADE,
  feedback_item_id uuid REFERENCES public.feedback_items(id) ON DELETE CASCADE,
  PRIMARY KEY (feature_request_group_id, feedback_item_id)
);

-- 7. Renewal Operations
CREATE TABLE IF NOT EXISTS public.renewal_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  subscription_id uuid NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  contact_status text NOT NULL DEFAULT 'NOT_CONTACTED', -- NOT_CONTACTED, REMINDER_SENT, WHATSAPP_SENT, INTERESTED, RENEWED, NO_RESPONSE, DECLINED
  channel text, -- WHATSAPP, EMAIL, PHONE
  note text,
  next_action_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_renewal_org_status ON public.renewal_activities(organization_id, contact_status);

-- 8. Refund Requests
CREATE TABLE IF NOT EXISTS public.refund_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL REFERENCES public.billing_transactions(id) ON DELETE RESTRICT,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  amount numeric NOT NULL,
  reason text NOT NULL,
  provider_status text, -- REQUESTED, APPROVED, REJECTED, PROCESSED (only if provider gives real status)
  internal_status text NOT NULL DEFAULT 'REQUESTED',
  requested_at timestamptz DEFAULT now(),
  resolved_at timestamptz,
  resolved_by uuid REFERENCES auth.users(id)
);

-- 9. Internal Platform Admin Notes
CREATE TABLE IF NOT EXISTS public.admin_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL, -- ORGANIZATION, SUBSCRIPTION, PAYMENT, SUPPORT_TICKET
  entity_id uuid NOT NULL,
  author_user_id uuid REFERENCES auth.users(id),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_notes_entity ON public.admin_notes(entity_type, entity_id);

-- 10. Immutable Platform Admin Audit Logs
CREATE TABLE IF NOT EXISTS public.platform_admin_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid REFERENCES auth.users(id),
  action text NOT NULL, -- ADMIN_LOGIN, SUBSCRIPTION_OVERRIDE, SUBSCRIPTION_SUSPENDED, SUBSCRIPTION_REACTIVATED, PAYMENT_RECONCILED, REFUND_ACTION, TENANT_STATUS_CHANGED, SUPPORT_ACCESS, CONFIG_CHANGED
  target_type text NOT NULL,
  target_id text NOT NULL,
  reason text,
  before_state jsonb,
  after_state jsonb,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_paal_created_at ON public.platform_admin_audit_logs(created_at DESC);

-- 11. System Incidents & Error Monitoring
CREATE TABLE IF NOT EXISTS public.system_incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service text NOT NULL, -- APPLICATION, DATABASE, SUPABASE_AUTH, STORAGE, MAYAR, WEBHOOK, EMAIL, PDF_GENERATION
  severity text NOT NULL DEFAULT 'LOW', -- LOW, MEDIUM, HIGH, CRITICAL
  status text NOT NULL DEFAULT 'OPEN', -- OPEN, INVESTIGATING, RESOLVED, IGNORED
  error_code text,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  operation text,
  message_sanitized text NOT NULL,
  detected_at timestamptz DEFAULT now(),
  resolved_at timestamptz,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_incidents_service_status ON public.system_incidents(service, status);

-- 12. Platform Settings
CREATE TABLE IF NOT EXISTS public.platform_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  description text,
  updated_by uuid REFERENCES auth.users(id),
  updated_at timestamptz DEFAULT now()
);

-- Seed Initial Safe Operational Settings
INSERT INTO public.platform_settings (key, value, description)
VALUES
  ('renewal_thresholds', '{"expiring_soon_days": 7, "critical_days": 3, "renewal_window_days": 30}'::jsonb, 'Ambang batas hari notifikasi renewal langganan kantor'),
  ('health_thresholds', '{"inactive_days_warning": 14, "inactive_days_critical": 30, "min_matters_for_active": 1}'::jsonb, 'Parameter kalkulasi kesehatan tenant NotaryGo'),
  ('attention_thresholds', '{"payment_pending_timeout_hours": 24, "unclaimed_warning_hours": 12}'::jsonb, 'Batas waktu deteksi attention required untuk transaksi Mayar')
ON CONFLICT (key) DO NOTHING;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES FOR PLATFORM TABLES
-- ==============================================================================

ALTER TABLE public.provider_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reconciliation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_request_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_request_group_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.renewal_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refund_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Platform Superadmin Full Select & Write Policies
DROP POLICY IF EXISTS "Superadmin full access on provider_webhook_events" ON public.provider_webhook_events;
CREATE POLICY "Superadmin full access on provider_webhook_events" ON public.provider_webhook_events
  FOR ALL USING (public.is_platform_admin());

DROP POLICY IF EXISTS "Superadmin full access on reconciliation_items" ON public.reconciliation_items;
CREATE POLICY "Superadmin full access on reconciliation_items" ON public.reconciliation_items
  FOR ALL USING (public.is_platform_admin());

DROP POLICY IF EXISTS "Superadmin full access on support_tickets" ON public.support_tickets;
CREATE POLICY "Superadmin full access on support_tickets" ON public.support_tickets
  FOR ALL USING (public.is_platform_admin());

-- Tenant users can create tickets for their own org
DROP POLICY IF EXISTS "Tenant users can view own support tickets" ON public.support_tickets;
CREATE POLICY "Tenant users can view own support tickets" ON public.support_tickets
  FOR SELECT USING (organization_id IS NOT NULL AND public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Tenant users can insert support tickets" ON public.support_tickets;
CREATE POLICY "Tenant users can insert support tickets" ON public.support_tickets
  FOR INSERT WITH CHECK (organization_id IS NOT NULL AND public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Superadmin full access on feedback_items" ON public.feedback_items;
CREATE POLICY "Superadmin full access on feedback_items" ON public.feedback_items
  FOR ALL USING (public.is_platform_admin());

DROP POLICY IF EXISTS "Tenant users can submit feedback" ON public.feedback_items;
CREATE POLICY "Tenant users can submit feedback" ON public.feedback_items
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Superadmin full access on feature_request_groups" ON public.feature_request_groups;
CREATE POLICY "Superadmin full access on feature_request_groups" ON public.feature_request_groups
  FOR ALL USING (public.is_platform_admin());

DROP POLICY IF EXISTS "Superadmin full access on renewal_activities" ON public.renewal_activities;
CREATE POLICY "Superadmin full access on renewal_activities" ON public.renewal_activities
  FOR ALL USING (public.is_platform_admin());

DROP POLICY IF EXISTS "Superadmin full access on refund_requests" ON public.refund_requests;
CREATE POLICY "Superadmin full access on refund_requests" ON public.refund_requests
  FOR ALL USING (public.is_platform_admin());

DROP POLICY IF EXISTS "Superadmin full access on admin_notes" ON public.admin_notes;
CREATE POLICY "Superadmin full access on admin_notes" ON public.admin_notes
  FOR ALL USING (public.is_platform_admin());

DROP POLICY IF EXISTS "Superadmin view platform_admin_audit_logs" ON public.platform_admin_audit_logs;
CREATE POLICY "Superadmin view platform_admin_audit_logs" ON public.platform_admin_audit_logs
  FOR SELECT USING (public.is_platform_admin());

DROP POLICY IF EXISTS "Superadmin insert platform_admin_audit_logs" ON public.platform_admin_audit_logs;
CREATE POLICY "Superadmin insert platform_admin_audit_logs" ON public.platform_admin_audit_logs
  FOR INSERT WITH CHECK (public.is_platform_admin());

DROP POLICY IF EXISTS "Superadmin full access on system_incidents" ON public.system_incidents;
CREATE POLICY "Superadmin full access on system_incidents" ON public.system_incidents
  FOR ALL USING (public.is_platform_admin());

DROP POLICY IF EXISTS "Superadmin full access on platform_settings" ON public.platform_settings;
CREATE POLICY "Superadmin full access on platform_settings" ON public.platform_settings
  FOR ALL USING (public.is_platform_admin());

-- Allow platform superadmin to view all organization members and profiles for user directory
DROP POLICY IF EXISTS "Platform admins can view all organization_members" ON public.organization_members;
CREATE POLICY "Platform admins can view all organization_members" ON public.organization_members
  FOR SELECT USING (public.is_platform_admin());

DROP POLICY IF EXISTS "Platform admins can view all profiles" ON public.profiles;
CREATE POLICY "Platform admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_platform_admin());

