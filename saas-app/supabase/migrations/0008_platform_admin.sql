-- Migration: 0008_platform_admin
-- Adds Platform Admin tables, audit logs, and cross-tenant read policies for non-sensitive data.

-- 1. Platform Admins Identity Table
-- This is the strict source of truth for platform administrators.
CREATE TABLE public.platform_admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(profile_id)
);

-- RLS: Only platform admins can view this table
ALTER TABLE public.platform_admins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Platform admins can view platform_admins" ON public.platform_admins
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.platform_admins WHERE profile_id = auth.uid())
  );

-- Function to check if current user is a platform admin (optimised for RLS)
CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.platform_admins WHERE profile_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. Impersonation & Audit Logs
CREATE TABLE public.platform_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL REFERENCES public.profiles(id),
  action text NOT NULL,
  target_org_id uuid REFERENCES public.organizations(id),
  reason text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.platform_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Platform admins can view audit logs" ON public.platform_audit_logs
  FOR SELECT USING (public.is_platform_admin());
CREATE POLICY "Platform admins can insert audit logs" ON public.platform_audit_logs
  FOR INSERT WITH CHECK (public.is_platform_admin() AND auth.uid() = admin_id);


-- 3. Extend RLS Policies for Platform Admins to view non-sensitive tenant data
-- Organizations
CREATE POLICY "Platform admins can view all organizations" ON public.organizations
  FOR SELECT USING (public.is_platform_admin());

-- Subscriptions
CREATE POLICY "Platform admins can view all subscriptions" ON public.subscriptions
  FOR SELECT USING (public.is_platform_admin());

-- Matters (Meta-data only for metrics, not documents)
CREATE POLICY "Platform admins can view all matters" ON public.matters
  FOR SELECT USING (public.is_platform_admin());

-- Invoices (For financial aggregation)
CREATE POLICY "Platform admins can view all invoices" ON public.invoices
  FOR SELECT USING (public.is_platform_admin());

-- Payments (For financial aggregation)
CREATE POLICY "Platform admins can view all payments" ON public.payments
  FOR SELECT USING (public.is_platform_admin());
