-- Migration: 0003_core_operations
-- Sets up Clients, Service Types, Matters, Workflows, Tasks, Checklists, and Activity Logging.

-- ==========================================
-- Enums
-- ==========================================
CREATE TYPE public.client_type AS ENUM ('INDIVIDUAL', 'CORPORATE');
CREATE TYPE public.matter_status AS ENUM ('OPEN', 'IN_PROGRESS', 'WAITING', 'CLOSED', 'CANCELED');
CREATE TYPE public.task_status AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELED');
CREATE TYPE public.checklist_status AS ENUM ('PENDING', 'RECEIVED', 'VERIFIED', 'REJECTED');

-- ==========================================
-- Core Entities
-- ==========================================

-- Clients
CREATE TABLE public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  client_type public.client_type NOT NULL DEFAULT 'INDIVIDUAL',
  name text NOT NULL,
  identifier text, -- NIK / NPWP
  email text,
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_clients_org_id ON public.clients(org_id);

-- Service Types (e.g., "Deed of Sale", "Company Establishment")
CREATE TABLE public.service_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  code text NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(org_id, code)
);
ALTER TABLE public.service_types ENABLE ROW LEVEL SECURITY;

-- Partners (e.g., Banks, Agents)
CREATE TABLE public.partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text,
  contact_person text,
  created_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- Matters (The main file/dossier)
CREATE TABLE public.matters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE RESTRICT,
  partner_id uuid REFERENCES public.partners(id),
  service_type_id uuid NOT NULL REFERENCES public.service_types(id),
  matter_number text NOT NULL, -- e.g., MAT-2026-0001
  title text NOT NULL,
  status public.matter_status NOT NULL DEFAULT 'OPEN',
  pic_id uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(org_id, matter_number)
);
ALTER TABLE public.matters ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_matters_org_id ON public.matters(org_id);
CREATE INDEX idx_matters_client_id ON public.matters(client_id);

-- ==========================================
-- Templates (Workflow & Checklists)
-- ==========================================

CREATE TABLE public.workflow_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  service_type_id uuid NOT NULL REFERENCES public.service_types(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);
ALTER TABLE public.workflow_templates ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.workflow_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES public.workflow_templates(id) ON DELETE CASCADE,
  step_order int NOT NULL,
  title text NOT NULL,
  description text,
  estimated_days int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.workflow_steps ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.checklist_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  service_type_id uuid NOT NULL REFERENCES public.service_types(id) ON DELETE CASCADE,
  item_name text NOT NULL,
  is_mandatory boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.checklist_templates ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- Actionable Items
-- ==========================================

-- Tasks
CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  matter_id uuid NOT NULL REFERENCES public.matters(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status public.task_status NOT NULL DEFAULT 'PENDING',
  assigned_to uuid REFERENCES public.profiles(id),
  deadline timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_tasks_org_id ON public.tasks(org_id);
CREATE INDEX idx_tasks_assigned_to ON public.tasks(assigned_to);

-- Checklist Items (Actual items required for a matter)
CREATE TABLE public.checklist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  matter_id uuid NOT NULL REFERENCES public.matters(id) ON DELETE CASCADE,
  item_name text NOT NULL,
  status public.checklist_status NOT NULL DEFAULT 'PENDING',
  is_mandatory boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;

-- Pending Items (Blocking issues)
CREATE TABLE public.pending_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  matter_id uuid NOT NULL REFERENCES public.matters(id) ON DELETE CASCADE,
  description text NOT NULL,
  resolved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);
ALTER TABLE public.pending_items ENABLE ROW LEVEL SECURITY;

-- Follow Ups
CREATE TABLE public.follow_ups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  matter_id uuid NOT NULL REFERENCES public.matters(id) ON DELETE CASCADE,
  notes text NOT NULL,
  follow_up_date timestamptz NOT NULL,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- Audit & Workflow History
-- ==========================================

CREATE TABLE public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES public.profiles(id),
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_activity_logs_org_id ON public.activity_logs(org_id, created_at DESC);

-- ==========================================
-- RLS Policies (Base isolation filtering by deleted_at and org_id)
-- ==========================================

-- A macro function to apply common policy logic
-- We will use the previously created public.is_org_member()

-- Clients
CREATE POLICY "Members can view clients" ON public.clients FOR SELECT USING (public.is_org_member(org_id) AND deleted_at IS NULL);
CREATE POLICY "Members can insert clients" ON public.clients FOR INSERT WITH CHECK (public.is_org_member(org_id));
CREATE POLICY "Members can update clients" ON public.clients FOR UPDATE USING (public.is_org_member(org_id) AND deleted_at IS NULL);

-- Service Types
CREATE POLICY "Members can view service types" ON public.service_types FOR SELECT USING (public.is_org_member(org_id) AND deleted_at IS NULL);

-- Partners
CREATE POLICY "Members can view partners" ON public.partners FOR SELECT USING (public.is_org_member(org_id) AND deleted_at IS NULL);

-- Matters
CREATE POLICY "Members can view matters" ON public.matters FOR SELECT USING (public.is_org_member(org_id) AND deleted_at IS NULL);
CREATE POLICY "Members can insert matters" ON public.matters FOR INSERT WITH CHECK (public.is_org_member(org_id));
CREATE POLICY "Members can update matters" ON public.matters FOR UPDATE USING (public.is_org_member(org_id) AND deleted_at IS NULL);

-- Templates
CREATE POLICY "Members can view templates" ON public.workflow_templates FOR SELECT USING (public.is_org_member(org_id) AND deleted_at IS NULL);
CREATE POLICY "Members can view steps" ON public.workflow_steps FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.workflow_templates t WHERE t.id = template_id AND public.is_org_member(t.org_id))
);
CREATE POLICY "Members can view checklist templates" ON public.checklist_templates FOR SELECT USING (public.is_org_member(org_id));

-- Tasks
CREATE POLICY "Members can view tasks" ON public.tasks FOR SELECT USING (public.is_org_member(org_id) AND deleted_at IS NULL);
CREATE POLICY "Members can insert tasks" ON public.tasks FOR INSERT WITH CHECK (public.is_org_member(org_id));
CREATE POLICY "Staff can update assigned tasks or Admins can update all" ON public.tasks FOR UPDATE USING (
  (public.is_org_member(org_id) AND assigned_to = auth.uid() AND deleted_at IS NULL)
  OR public.has_org_role(org_id, 'ADMIN')
  OR public.has_org_role(org_id, 'OWNER')
);

-- Actionable items generic policies
CREATE POLICY "Members can view checklist items" ON public.checklist_items FOR SELECT USING (public.is_org_member(org_id));
CREATE POLICY "Members can update checklist items" ON public.checklist_items FOR UPDATE USING (public.is_org_member(org_id));

CREATE POLICY "Members can view pending items" ON public.pending_items FOR SELECT USING (public.is_org_member(org_id));
CREATE POLICY "Members can update pending items" ON public.pending_items FOR UPDATE USING (public.is_org_member(org_id));

CREATE POLICY "Members can view follow ups" ON public.follow_ups FOR SELECT USING (public.is_org_member(org_id));
CREATE POLICY "Members can update follow ups" ON public.follow_ups FOR UPDATE USING (public.is_org_member(org_id));

-- Activity Logs
CREATE POLICY "Members can view activity logs" ON public.activity_logs FOR SELECT USING (public.is_org_member(org_id));
CREATE POLICY "System can insert logs" ON public.activity_logs FOR INSERT WITH CHECK (public.is_org_member(org_id));

