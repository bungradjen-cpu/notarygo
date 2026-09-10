import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export class PdfEngine {
  /**
   * Generates a standardized Invoice PDF
   */
  static generateInvoicePdf(
    orgName: string,
    invoiceData: {
      invoiceNumber: string;
      issueDate: Date;
      dueDate: Date;
      clientName: string;
      matterTitle: string;
      items: { description: string; quantity: number; unitPrice: number; totalPrice: number }[];
      subtotal: number;
      taxAmount: number;
      totalAmount: number;
    }
  ): Buffer {
    const doc = new jsPDF();
    
    // Header - Stitch Theme Navy
    doc.setFontSize(20);
    doc.setTextColor(0, 31, 63); // #001f3f
    doc.setFont('helvetica', 'bold');
    doc.text(orgName, 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.setFont('helvetica', 'normal');
    doc.text('FAKTUR TAGIHAN / INVOICE', 14, 29);
    doc.text(`No. Invoice: ${invoiceData.invoiceNumber}`, 14, 35);
    doc.text(`Tgl Terbit: ${invoiceData.issueDate.toLocaleDateString('id-ID')}`, 14, 41);
    doc.text(`Jatuh Tempo: ${invoiceData.dueDate.toLocaleDateString('id-ID')}`, 14, 47);
    
    // Client Info
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 31, 63);
    doc.text('Ditagihkan Kepada:', 120, 35);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(40);
    doc.text(invoiceData.clientName, 120, 41);
    doc.text(`Perkara: ${invoiceData.matterTitle}`, 120, 47);
    
    // Items Table
    const tableColumn = ["Uraian Biaya / Jasa", "Jumlah", "Harga Satuan", "Total (Rp)"];
    const tableRows = invoiceData.items.map(item => [
      item.description,
      item.quantity.toString(),
      `Rp ${item.unitPrice.toLocaleString('id-ID')}`,
      `Rp ${item.totalPrice.toLocaleString('id-ID')}`
    ]);

    // Use autoTable directly as a function
    autoTable(doc, {
      startY: 55,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [0, 31, 63], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 3 }
    });

    // Totals
    const lastAutoTable = (doc as any).lastAutoTable;
    const finalY = lastAutoTable?.finalY ? lastAutoTable.finalY + 10 : 120;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80);
    doc.text(`Subtotal: Rp ${invoiceData.subtotal.toLocaleString('id-ID')}`, 120, finalY);
    doc.text(`Pajak / PPN: Rp ${invoiceData.taxAmount.toLocaleString('id-ID')}`, 120, finalY + 6);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 31, 63);
    doc.text(`Total Tagihan: Rp ${invoiceData.totalAmount.toLocaleString('id-ID')}`, 120, finalY + 14);

    // Return as Buffer
    const arrayBuffer = doc.output('arraybuffer');
    return Buffer.from(arrayBuffer);
  }

  /**
   * Generates a Receipt PDF
   */
  static generateReceiptPdf(
    orgName: string,
    receiptData: {
      receiptNumber: string;
      paymentDate: Date;
      clientName: string;
      matterTitle: string;
      amountPaid: number;
      paymentMethod: string;
      referenceNumber?: string;
    }
  ): Buffer {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(0, 31, 63);
    doc.setFont('helvetica', 'bold');
    doc.text(orgName, 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.setFont('helvetica', 'normal');
    doc.text('KWITANSI PEMBAYARAN / RECEIPT', 14, 29);
    doc.text(`No. Kwitansi: ${receiptData.receiptNumber}`, 14, 35);
    doc.text(`Tanggal: ${receiptData.paymentDate.toLocaleDateString('id-ID')}`, 14, 41);
    
    // Info
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 31, 63);
    doc.text(`Diterima Dari: ${receiptData.clientName}`, 14, 55);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(40);
    doc.text(`Untuk Perkara: ${receiptData.matterTitle}`, 14, 61);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(16, 185, 129); // #10B981 Green
    doc.text(`Jumlah Diterima: Rp ${receiptData.amountPaid.toLocaleString('id-ID')}`, 14, 75);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60);
    doc.text(`Metode Pembayaran: ${receiptData.paymentMethod.replace(/_/g, ' ')}`, 14, 85);
    if (receiptData.referenceNumber) {
      doc.text(`No. Referensi: ${receiptData.referenceNumber}`, 14, 91);
    }

    doc.text('Terima kasih atas pembayaran Anda.', 14, 105);

    const arrayBuffer = doc.output('arraybuffer');
    return Buffer.from(arrayBuffer);
  }
}
