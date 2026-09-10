import { createClient } from "@/utils/supabase/server";
import { PdfEngine } from "@/lib/pdf/PdfEngine";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id: paymentId } = await params;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Fetch full payment & invoice details
  const { data: payment } = await supabase
    .from("payments")
    .select(`
      *,
      invoices(
        invoice_number,
        organizations(name),
        matters(matter_number, title, clients(name))
      )
    `)
    .eq("id", paymentId)
    .single();

  if (!payment) {
    return new NextResponse("Payment record not found", { status: 404 });
  }

  const invoice = payment.invoices as any;
  const receiptNumber = `RCT-${payment.id.substring(0, 8).toUpperCase()}`;

  const pdfBuffer = PdfEngine.generateReceiptPdf(
    invoice?.organizations?.name || "Kantor Notaris & PPAT",
    {
      receiptNumber: receiptNumber,
      paymentDate: payment.payment_date ? new Date(payment.payment_date) : new Date(payment.created_at),
      clientName: invoice?.matters?.clients?.name || "Klien Notaris",
      matterTitle: invoice?.matters?.title || "Perkara Notaris",
      amountPaid: Number(payment.amount),
      paymentMethod: payment.method || "BANK_TRANSFER",
      referenceNumber: payment.reference_number || undefined,
    }
  );

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${receiptNumber}.pdf"`,
    },
  });
}
