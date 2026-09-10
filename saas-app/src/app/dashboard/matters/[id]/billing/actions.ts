"use server";

import { createClient } from "@/utils/supabase/server";
import { BillingService } from "@/lib/operations/BillingService";
import { revalidatePath } from "next/cache";

export async function createDraftInvoiceAction(matterId: string, orgId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase.from("invoices").insert({
    org_id: orgId,
    matter_id: matterId,
    status: 'DRAFT',
    due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // 14 days from now
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/dashboard/matters/${matterId}/billing`);
}

export async function addInvoiceItemAction(invoiceId: string, matterId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const description = formData.get("description") as string;
  const quantity = Number(formData.get("quantity") || 1);
  const unitPrice = Number(formData.get("unitPrice") || 0);
  const totalPrice = quantity * unitPrice;

  const { error } = await supabase.from("invoice_items").insert({
    invoice_id: invoiceId,
    description,
    quantity,
    unit_price: unitPrice,
    total_price: totalPrice
  });

  if (error) throw new Error(error.message);

  // Sync total_amount with existing tax_amount
  const { data: inv } = await supabase
    .from("invoices")
    .select("subtotal, tax_amount, paid_amount")
    .eq("id", invoiceId)
    .single();

  if (inv) {
    const subtotal = Number(inv.subtotal || 0);
    const taxAmount = Number(inv.tax_amount || 0);
    const paidAmount = Number(inv.paid_amount || 0);
    const totalAmount = subtotal + taxAmount;
    const balanceDue = totalAmount - paidAmount;

    await supabase
      .from("invoices")
      .update({
        total_amount: totalAmount,
        balance_due: balanceDue,
      })
      .eq("id", invoiceId);
  }

  revalidatePath(`/dashboard/matters/${matterId}/billing`);
}

export async function deleteInvoiceItemAction(itemId: string, invoiceId: string, matterId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase.from("invoice_items").delete().eq("id", itemId);
  if (error) throw new Error(error.message);

  // Sync totals
  const { data: inv } = await supabase
    .from("invoices")
    .select("subtotal, tax_amount, paid_amount")
    .eq("id", invoiceId)
    .single();

  if (inv) {
    const subtotal = Number(inv.subtotal || 0);
    const taxAmount = Number(inv.tax_amount || 0);
    const paidAmount = Number(inv.paid_amount || 0);
    const totalAmount = subtotal + taxAmount;
    const balanceDue = totalAmount - paidAmount;

    await supabase
      .from("invoices")
      .update({
        total_amount: totalAmount,
        balance_due: balanceDue,
      })
      .eq("id", invoiceId);
  }

  revalidatePath(`/dashboard/matters/${matterId}/billing`);
}

export async function updateInvoiceTaxAction(invoiceId: string, matterId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const taxAmount = Math.max(0, Number(formData.get("taxAmount") || 0));

  const { data: inv } = await supabase
    .from("invoices")
    .select("subtotal, paid_amount")
    .eq("id", invoiceId)
    .single();

  const subtotal = Number(inv?.subtotal || 0);
  const paidAmount = Number(inv?.paid_amount || 0);
  const totalAmount = subtotal + taxAmount;
  const balanceDue = totalAmount - paidAmount;

  const { error } = await supabase
    .from("invoices")
    .update({
      tax_amount: taxAmount,
      total_amount: totalAmount,
      balance_due: balanceDue,
    })
    .eq("id", invoiceId);

  if (error) throw new Error(error.message);
  revalidatePath(`/dashboard/matters/${matterId}/billing`);
}

export async function issueInvoiceAction(invoiceId: string, orgId: string, matterId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  await BillingService.issueInvoice(orgId, invoiceId, user.id);
  revalidatePath(`/dashboard/matters/${matterId}/billing`);
}

export async function recordPaymentAction(invoiceId: string, orgId: string, matterId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const amount = Number(formData.get("amount"));
  const method = formData.get("method") as string;
  const reference = formData.get("reference") as string;

  await BillingService.recordPayment(orgId, invoiceId, amount, method, reference, user.id);
  revalidatePath(`/dashboard/matters/${matterId}/billing`);
}

