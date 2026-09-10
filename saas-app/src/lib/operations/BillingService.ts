import { createClient } from "@/utils/supabase/server";
import { PdfEngine } from "../pdf/PdfEngine";
import { DocumentService } from "./DocumentService";

export class BillingService {
  /**
   * Issues an invoice, generates its PDF, and stores it in the Document Center.
   */
  static async issueInvoice(orgId: string, invoiceId: string, userId: string) {
    const supabase = await createClient();

    // 1. Fetch full invoice details
    const { data: invoice } = await supabase
      .from("invoices")
      .select(`
        *,
        matters(matter_number, title, clients(name)),
        invoice_items(description, quantity, unit_price, total_price)
      `)
      .eq("id", invoiceId)
      .single();

    if (!invoice) throw new Error("Invoice not found");

    const { data: org } = await supabase.from("organizations").select("name").eq("id", orgId).single();

    // 2. Generate Invoice Number
    const invNumber = `INV-${new Date().getFullYear()}-${invoiceId.substring(0, 5).toUpperCase()}`;

    // 3. Generate PDF Buffer
    const pdfBuffer = PdfEngine.generateInvoicePdf(
      org?.name || "NotaryGo Office",
      {
        invoiceNumber: invNumber,
        issueDate: new Date(),
        dueDate: invoice.due_date ? new Date(invoice.due_date) : new Date(),
        clientName: invoice.matters?.clients?.name || "Unknown Client",
        matterTitle: invoice.matters?.title || "Unknown Matter",
        items: invoice.invoice_items.map((i: any) => ({
          description: i.description,
          quantity: Number(i.quantity),
          unitPrice: Number(i.unit_price),
          totalPrice: Number(i.total_price)
        })),
        subtotal: Number(invoice.subtotal),
        taxAmount: Number(invoice.tax_amount),
        totalAmount: Number(invoice.total_amount)
      }
    );

    // 4. Store PDF via DocumentService (Creates a Document & Storage Object)
    try {
      const file = new File([new Uint8Array(pdfBuffer)], `${invNumber}.pdf`, { type: 'application/pdf' });
      await DocumentService.uploadDocumentVersion(
        orgId, 
        invoice.matter_id, 
        "", // New document
        file, 
        userId, 
        `Invoice ${invNumber}`
      );
    } catch (docErr: any) {
      console.warn("Could not save invoice PDF to Document Center:", docErr.message);
    }

    // 5. Update Invoice Status
    await supabase
      .from("invoices")
      .update({ status: 'ISSUED', invoice_number: invNumber, issue_date: new Date().toISOString() })
      .eq("id", invoiceId);
  }

  /**
   * Records a payment, updates the invoice status, and generates a Receipt PDF.
   */
  static async recordPayment(orgId: string, invoiceId: string, amount: number, method: string, referenceNumber: string, userId: string) {
    const supabase = await createClient();

    // 1. Record the Payment
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert({
        invoice_id: invoiceId,
        amount,
        method,
        reference_number: referenceNumber,
        recorded_by: userId
      })
      .select("id")
      .single();

    if (paymentError || !payment) throw new Error("Failed to record payment");

    // The Postgres Trigger `recalculate_invoice_totals` will automatically run here
    // We fetch the updated invoice to check its new status
    const { data: invoice } = await supabase
      .from("invoices")
      .select("*, matters(matter_number, title, clients(name))")
      .eq("id", invoiceId)
      .single();

    if (invoice) {
      let newStatus = invoice.status;
      if (Number(invoice.balance_due) <= 0) {
        newStatus = 'PAID';
      } else if (Number(invoice.paid_amount) > 0) {
        newStatus = 'PARTIAL';
      }

      await supabase.from("invoices").update({ status: newStatus }).eq("id", invoiceId);
      
      const { data: org } = await supabase.from("organizations").select("name").eq("id", orgId).single();

      // 2. Generate Receipt PDF
      const receiptNumber = `RCT-${new Date().getFullYear()}-${payment.id.substring(0, 5).toUpperCase()}`;
      
      const pdfBuffer = PdfEngine.generateReceiptPdf(
        org?.name || "NotaryGo Office",
        {
          receiptNumber,
          paymentDate: new Date(),
          clientName: invoice.matters?.clients?.name || "Unknown Client",
          matterTitle: invoice.matters?.title || "Unknown Matter",
          amountPaid: amount,
          paymentMethod: method,
          referenceNumber
        }
      );

      try {
        const file = new File([new Uint8Array(pdfBuffer)], `${receiptNumber}.pdf`, { type: 'application/pdf' });
        await DocumentService.uploadDocumentVersion(
          orgId, 
          invoice.matter_id, 
          "", 
          file, 
          userId, 
          `Receipt ${receiptNumber}`
        );

        // Link receipt record (Optional but good for tracking)
        await supabase.from("receipts").insert({
          payment_id: payment.id,
          receipt_number: receiptNumber
        });
      } catch (receiptErr: any) {
        console.warn("Could not save receipt PDF to Document Center:", receiptErr.message);
      }
    }
  }
}
