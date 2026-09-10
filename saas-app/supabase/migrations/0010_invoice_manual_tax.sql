-- Migration: 0010_invoice_manual_tax
-- Ensures recalculate_invoice_totals preserves manual tax_amount inputted by Finance role

CREATE OR REPLACE FUNCTION public.recalculate_invoice_totals()
RETURNS TRIGGER AS $$
DECLARE
  target_invoice_id uuid;
  new_subtotal numeric(15,2);
  new_paid numeric(15,2);
  current_tax numeric(15,2);
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

  -- Fetch existing tax_amount
  SELECT COALESCE(tax_amount, 0.00) INTO current_tax
  FROM public.invoices
  WHERE id = target_invoice_id;

  new_total := new_subtotal + current_tax;

  -- Update invoice totals
  UPDATE public.invoices
  SET subtotal = new_subtotal,
      total_amount = new_total,
      paid_amount = new_paid,
      balance_due = new_total - new_paid,
      updated_at = now()
  WHERE id = target_invoice_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
