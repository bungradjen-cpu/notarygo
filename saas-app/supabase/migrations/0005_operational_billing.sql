-- Migration: 0005_operational_billing
-- Sets up Invoices, Invoice Items, Payments, Receipts, and recalculation triggers.

-- ==========================================
-- Enums
-- ==========================================
CREATE TYPE public.invoice_status AS ENUM ('DRAFT', 'ISSUED', 'PARTIAL', 'PAID', 'VOID');
CREATE TYPE public.payment_method AS ENUM ('BANK_TRANSFER', 'CASH', 'CREDIT_CARD', 'CHECK', 'OTHER');

-- ==========================================
-- Core Entities
-- ==========================================

-- Invoices
CREATE TABLE public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  matter_id uuid NOT NULL REFERENCES public.matters(id) ON DELETE CASCADE,
  invoice_number text, -- Auto-generated upon issue
  status public.invoice_status NOT NULL DEFAULT 'DRAFT',
  issue_date timestamptz,
  due_date timestamptz,
  subtotal numeric(15, 2) NOT NULL DEFAULT 0.00,
  tax_amount numeric(15, 2) NOT NULL DEFAULT 0.00,
  total_amount numeric(15, 2) NOT NULL DEFAULT 0.00,
  paid_amount numeric(15, 2) NOT NULL DEFAULT 0.00,
  balance_due numeric(15, 2) NOT NULL DEFAULT 0.00,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(org_id, invoice_number)
);
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_invoices_org_id ON public.invoices(org_id);
CREATE INDEX idx_invoices_matter_id ON public.invoices(matter_id);

-- Invoice Items
CREATE TABLE public.invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  description text NOT NULL,
  quantity numeric(10, 2) NOT NULL DEFAULT 1.00,
  unit_price numeric(15, 2) NOT NULL DEFAULT 0.00,
  total_price numeric(15, 2) NOT NULL DEFAULT 0.00,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

-- Payments
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  amount numeric(15, 2) NOT NULL,
  payment_date timestamptz NOT NULL DEFAULT now(),
  method public.payment_method NOT NULL DEFAULT 'BANK_TRANSFER',
  reference_number text,
  recorded_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Receipts
CREATE TABLE public.receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id uuid NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
  receipt_number text NOT NULL,
  issued_date timestamptz DEFAULT now(),
  document_version_id uuid REFERENCES public.document_versions(id) ON DELETE SET NULL, -- Link to PDF
  created_at timestamptz DEFAULT now(),
  UNIQUE(payment_id)
);
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- Recalculation Triggers & Functions
-- ==========================================

-- Function: recalculate_invoice_totals
-- Recalculates subtotal, total, paid, balance_due when items or payments change.
CREATE OR REPLACE FUNCTION public.recalculate_invoice_totals()
RETURNS TRIGGER AS $$
DECLARE
  target_invoice_id uuid;
  new_subtotal numeric(15,2);
  new_paid numeric(15,2);
  new_total numeric(15,2);
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_invoice_id := OLD.invoice_id;
  ELSE
    target_invoice_id := NEW.invoice_id;
  END IF;

  -- Calculate sum of items
  SELECT COALESCE(SUM(total_price), 0.00) INTO new_subtotal
  FROM public.invoice_items
  WHERE invoice_id = target_invoice_id;

  -- Calculate sum of payments
  SELECT COALESCE(SUM(amount), 0.00) INTO new_paid
  FROM public.payments
  WHERE invoice_id = target_invoice_id;

  new_total := new_subtotal; -- Add tax logic here if needed

  -- Update invoice
  UPDATE public.invoices
  SET subtotal = new_subtotal,
      total_amount = new_total,
      paid_amount = new_paid,
      balance_due = new_total - new_paid,
      updated_at = now()
  WHERE id = target_invoice_id;

  RETURN NULL; -- AFTER trigger
END;
$$ LANGUAGE plpgsql;

-- Triggers on invoice_items
CREATE TRIGGER tr_invoice_items_calc
AFTER INSERT OR UPDATE OR DELETE ON public.invoice_items
FOR EACH ROW EXECUTE FUNCTION public.recalculate_invoice_totals();

-- Triggers on payments
CREATE TRIGGER tr_payments_calc
AFTER INSERT OR UPDATE OR DELETE ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.recalculate_invoice_totals();


-- ==========================================
-- RLS Policies
-- ==========================================

-- Invoices
CREATE POLICY "Members can view invoices" ON public.invoices FOR SELECT USING (public.is_org_member(org_id) AND deleted_at IS NULL);
CREATE POLICY "Members can insert invoices" ON public.invoices FOR INSERT WITH CHECK (public.is_org_member(org_id));
CREATE POLICY "Members can update invoices" ON public.invoices FOR UPDATE USING (public.is_org_member(org_id) AND deleted_at IS NULL);

-- Invoice Items
CREATE POLICY "Members can view invoice items" ON public.invoice_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.invoices i WHERE i.id = invoice_id AND public.is_org_member(i.org_id) AND i.deleted_at IS NULL)
);
CREATE POLICY "Members can insert invoice items" ON public.invoice_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.invoices i WHERE i.id = invoice_id AND public.is_org_member(i.org_id))
);
CREATE POLICY "Members can update/delete invoice items" ON public.invoice_items FOR ALL USING (
  EXISTS (SELECT 1 FROM public.invoices i WHERE i.id = invoice_id AND public.is_org_member(i.org_id))
);

-- Payments
CREATE POLICY "Members can view payments" ON public.payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.invoices i WHERE i.id = invoice_id AND public.is_org_member(i.org_id))
);
CREATE POLICY "Members can insert payments" ON public.payments FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.invoices i WHERE i.id = invoice_id AND public.is_org_member(i.org_id))
);

-- Receipts
CREATE POLICY "Members can view receipts" ON public.receipts FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.payments p
    JOIN public.invoices i ON p.invoice_id = i.id
    WHERE p.id = payment_id AND public.is_org_member(i.org_id)
  )
);
CREATE POLICY "Members can insert receipts" ON public.receipts FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.payments p
    JOIN public.invoices i ON p.invoice_id = i.id
    WHERE p.id = payment_id AND public.is_org_member(i.org_id)
  )
);
