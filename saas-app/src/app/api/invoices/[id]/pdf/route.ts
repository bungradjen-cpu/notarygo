import { createClient } from "@/utils/supabase/server";
import { PdfEngine } from "@/lib/pdf/PdfEngine";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id: invoiceId } = await params;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Fetch full invoice details
  const { data: invoice } = await supabase
    .from("invoices")
    .select(`
      *,
      matters(matter_number, title, clients(name)),
      invoice_items(description, quantity, unit_price, total_price),
      organizations(name)
    `)
    .eq("id", invoiceId)
    .single();

  if (!invoice) {
    return new NextResponse("Invoice not found", { status: 404 });
  }

  const invNumber = invoice.invoice_number || `INV-${invoice.id.substring(0, 8).toUpperCase()}`;

  // Generate PDF buffer on the fly
  const pdfBuffer = PdfEngine.generateInvoicePdf(
    (invoice.organizations as any)?.name || "Kantor Notaris & PPAT",
    {
      invoiceNumber: invNumber,
      issueDate: invoice.issue_date ? new Date(invoice.issue_date) : new Date(invoice.created_at),
      dueDate: invoice.due_date ? new Date(invoice.due_date) : new Date(),
      clientName: (invoice.matters as any)?.clients?.name || "Klien Notaris",
      matterTitle: (invoice.matters as any)?.title || "Perkara Notaris",
      items: (invoice.invoice_items || []).map((i: any) => ({
        description: i.description,
        quantity: Number(i.quantity),
        unitPrice: Number(i.unit_price),
        totalPrice: Number(i.total_price),
      })),
      subtotal: Number(invoice.subtotal || invoice.total_amount || 0),
      taxAmount: Number(invoice.tax_amount || 0),
      totalAmount: Number(invoice.total_amount || 0),
    }
  );

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${invNumber}.pdf"`,
    },
  });
}
