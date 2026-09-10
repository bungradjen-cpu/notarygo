/**
 * NOTARYGO™ — Notary Office Operational Control System
 * Document & PDF Generation Engine
 */

var PdfService = {
  /**
   * Builds standardized header and footer HTML for professional documents
   */
  _buildDocumentShell: function(title, bodyContent, watermarkText) {
    var office = OfficeService.getProfile();
    var watermarkHtml = watermarkText ?
      '<div style="position: absolute; top: 40%; left: 15%; font-size: 80px; color: rgba(220, 38, 38, 0.15); transform: rotate(-35deg); font-weight: bold; border: 8px solid rgba(220, 38, 38, 0.15); padding: 10px 40px; border-radius: 12px; pointer-events: none; text-align: center;">' + watermarkText + '</div>' : '';

    return '<!DOCTYPE html>' +
      '<html><head><meta charset="utf-8">' +
      '<style>' +
      '@page { size: A4 portrait; margin: 15mm 15mm 15mm 15mm; }' +
      'body { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; color: #0f172a; margin: 0; padding: 0; font-size: 13px; line-height: 1.5; }' +
      '.header { border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 20px; position: relative; }' +
      '.office-name { font-size: 16px; font-weight: bold; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; }' +
      '.notary-name { font-size: 18px; font-weight: bold; color: #d97706; margin-top: 2px; }' +
      '.office-sub { font-size: 11px; color: #475569; margin-top: 2px; }' +
      '.doc-title { font-size: 16px; font-weight: bold; text-align: center; text-transform: uppercase; margin: 20px 0 15px 0; color: #0f172a; letter-spacing: 1px; }' +
      '.meta-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }' +
      '.meta-table td { padding: 5px 8px; font-size: 12px; vertical-align: top; }' +
      '.meta-label { width: 25%; font-weight: bold; color: #475569; }' +
      '.data-table { width: 100%; border-collapse: collapse; margin: 15px 0; }' +
      '.data-table th { background-color: #0f172a; color: #ffffff; padding: 8px 10px; font-size: 12px; text-align: left; border: 1px solid #0f172a; }' +
      '.data-table td { padding: 8px 10px; border: 1px solid #cbd5e1; font-size: 12px; vertical-align: middle; }' +
      '.data-table tr:nth-child(even) { background-color: #f8fafc; }' +
      '.badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; }' +
      '.footer { margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 10px; font-size: 10px; color: #94a3b8; text-align: center; }' +
      '.signature-grid { width: 100%; margin-top: 40px; }' +
      '.signature-box { width: 45%; text-align: center; font-size: 12px; }' +
      '</style></head><body>' +
      watermarkHtml +
      '<div class="header">' +
      '<div class="office-name">' + office.officeName + '</div>' +
      '<div class="notary-name">' + office.notaryName + '</div>' +
      '<div class="office-sub">' + office.notaryTitle + ' | ' + office.address + ', ' + office.city + ' | Telp/WA: ' + (office.phone || office.whatsapp) + '</div>' +
      '</div>' +
      '<div class="doc-title">' + title + '</div>' +
      bodyContent +
      '<div class="footer">' +
      '<div>' + (office.footerText || 'Dokumen resmi diterbitkan oleh Kantor Notaris & PPAT.') + '</div>' +
      '<div style="margin-top: 2px;">Powered by <strong>NOTARYGO™</strong> — Notary Office Operational Control System</div>' +
      '</div>' +
      '</body></html>';
  },

  /**
   * Generates Invoice Document HTML & PDF
   */
  generateInvoiceHtml: function(invoiceId) {
    var details = BillingService.getInvoiceDetail(invoiceId);
    var inv = details.invoice;
    var matter = details.matter;
    var client = details.client;
    var office = details.office;
    var items = Utils.safeJsonParse(inv.itemsJson, []);

    var itemsRows = '';
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      itemsRows += '<tr>' +
        '<td style="text-align: center;">' + (i + 1) + '</td>' +
        '<td><strong>' + it.description + '</strong></td>' +
        '<td style="text-align: right;">' + Utils.formatCurrency(it.amount) + '</td>' +
        '</tr>';
    }

    var watermark = (inv.status === CONFIG.INVOICE_STATUS.PAID) ? 'LUNAS' : '';

    var body = '<table class="meta-table">' +
      '<tr>' +
      '<td class="meta-label">Nomor Invoice</td><td>: <strong>' + inv.invoiceNumber + '</strong></td>' +
      '<td class="meta-label">Kepada Yth.</td><td>: <strong>' + (client ? client.name : '-') + '</strong></td>' +
      '</tr>' +
      '<tr>' +
      '<td class="meta-label">Tanggal Terbit</td><td>: ' + Utils.formatDateIndo(inv.invoiceDate) + '</td>' +
      '<td class="meta-label">Perkara</td><td>: ' + (matter ? matter.matterNumber + ' (' + matter.title + ')' : '-') + '</td>' +
      '</tr>' +
      '<tr>' +
      '<td class="meta-label">Jatuh Tempo</td><td>: <span style="color: #dc2626; font-weight: bold;">' + Utils.formatDateIndo(inv.dueDate) + '</span></td>' +
      '<td class="meta-label">Status Tagihan</td><td>: <strong>' + inv.status + '</strong></td>' +
      '</tr>' +
      '</table>' +

      '<table class="data-table">' +
      '<thead><tr><th style="width: 8%; text-align: center;">No</th><th>Rincian Biaya / Layanan</th><th style="width: 25%; text-align: right;">Jumlah</th></tr></thead>' +
      '<tbody>' + itemsRows + '</tbody>' +
      '<tfoot>' +
      '<tr><td colspan="2" style="text-align: right; font-weight: bold;">Subtotal</td><td style="text-align: right; font-weight: bold;">' + Utils.formatCurrency(inv.subtotal) + '</td></tr>' +
      (inv.discount > 0 ? '<tr><td colspan="2" style="text-align: right; color: #16a34a;">Potongan / Diskon</td><td style="text-align: right; color: #16a34a;">- ' + Utils.formatCurrency(inv.discount) + '</td></tr>' : '') +
      (inv.tax > 0 ? '<tr><td colspan="2" style="text-align: right;">Pajak</td><td style="text-align: right;">+ ' + Utils.formatCurrency(inv.tax) + '</td></tr>' : '') +
      '<tr style="background-color: #f1f5f9;"><td colspan="2" style="text-align: right; font-size: 14px; font-weight: bold; color: #0f172a;">TOTAL TAGIHAN</td><td style="text-align: right; font-size: 14px; font-weight: bold; color: #0f172a;">' + Utils.formatCurrency(inv.total) + '</td></tr>' +
      '<tr><td colspan="2" style="text-align: right; color: #16a34a;">Telah Dibayar</td><td style="text-align: right; color: #16a34a;">' + Utils.formatCurrency(inv.paidAmount) + '</td></tr>' +
      '<tr style="background-color: #fef2f2;"><td colspan="2" style="text-align: right; font-weight: bold; color: #dc2626;">SISA PEMBAYARAN</td><td style="text-align: right; font-weight: bold; color: #dc2626;">' + Utils.formatCurrency(inv.outstanding) + '</td></tr>' +
      '</tfoot></table>' +

      '<div style="margin-top: 20px; padding: 12px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">' +
      '<strong>Instruksi Pembayaran:</strong><br>' +
      'Silakan melakukan pembayaran ke rekening resmi kantor kami:<br>' +
      'Bank: <strong>' + office.bankName + '</strong> | No. Rekening: <strong>' + office.bankAccount + '</strong><br>' +
      'Atas Nama: <strong>' + office.bankAccountName + '</strong>' +
      '</div>';

    return this._buildDocumentShell('INVOICE / TAGIHAN BIAYA', body, watermark);
  },

  /**
   * Generates Payment Receipt HTML
   */
  generateReceiptHtml: function(paymentId) {
    var payment = Repository.Payments.getById(paymentId);
    if (!payment) throw new Error('Pembayaran tidak ditemukan.');

    var invoice = Repository.Invoices.getById(payment.invoiceId);
    var matter = Repository.Matters.getById(payment.matterId);
    var client = invoice ? Repository.Clients.getById(invoice.clientId) : null;
    var office = OfficeService.getProfile();

    var isLunas = invoice && invoice.status === CONFIG.INVOICE_STATUS.PAID;
    var watermark = isLunas ? 'LUNAS' : 'DITERIMA';

    var body = '<table class="meta-table">' +
      '<tr>' +
      '<td class="meta-label">Nomor Kuitansi</td><td>: <strong>' + payment.receiptNumber + '</strong></td>' +
      '<td class="meta-label">Tanggal Bayar</td><td>: ' + Utils.formatDateIndo(payment.paymentDate) + '</td>' +
      '</tr>' +
      '<tr>' +
      '<td class="meta-label">Telah Diterima Dari</td><td>: <strong>' + (client ? client.name : '-') + '</strong></td>' +
      '<td class="meta-label">Metode Bayar</td><td>: ' + payment.method + ' ' + (payment.reference ? '(' + payment.reference + ')' : '') + '</td>' +
      '</tr>' +
      '<tr>' +
      '<td class="meta-label">Untuk Pembayaran</td><td>: Tagihan ' + (invoice ? invoice.invoiceNumber : '-') + ' | Perkara ' + (matter ? matter.matterNumber + ' (' + matter.title + ')' : '-') + '</td>' +
      '<td class="meta-label">Diterima Oleh</td><td>: ' + payment.receivedBy + '</td>' +
      '</tr>' +
      '</table>' +

      '<div style="margin: 25px 0; padding: 18px; background-color: #f8fafc; border: 2px dashed #0f172a; text-align: center; border-radius: 8px;">' +
      '<div style="font-size: 13px; color: #64748b; font-weight: bold; text-transform: uppercase;">Jumlah Pembayaran:</div>' +
      '<div style="font-size: 26px; font-weight: bold; color: #0f172a; margin-top: 4px;">' + Utils.formatCurrency(payment.amount) + '</div>' +
      (invoice ? '<div style="font-size: 12px; color: #64748b; margin-top: 6px;">Sisa Tagihan: ' + Utils.formatCurrency(invoice.outstanding) + ' (' + invoice.status + ')</div>' : '') +
      '</div>' +

      '<table class="signature-grid"><tr>' +
      '<td class="signature-box" style="width: 50%;"></td>' +
      '<td class="signature-box">' +
      office.city + ', ' + Utils.formatDateIndo(payment.paymentDate) + '<br>' +
      'Kasir / Bendahara Penerima,<br><br><br><br>' +
      '<strong>' + (payment.receivedBy || office.notaryName) + '</strong>' +
      '</td></tr></table>';

    return this._buildDocumentShell('KUITANSI PEMBAYARAN RESMI', body, watermark);
  },

  /**
   * Generates Document Checklist Verification Sheet HTML
   */
  generateChecklistHtml: function(matterId) {
    var matter = Repository.Matters.getById(matterId);
    if (!matter) throw new Error('Perkara tidak ditemukan.');

    var client = Repository.Clients.getById(matter.clientId);
    var items = Repository.ChecklistItems.find({ matterId: matterId });
    var stats = ChecklistService.calculateCompleteness(matterId);

    var rows = '';
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      var statusColor = it.status === 'VERIFIED' ? '#16a34a' : (it.status === 'RECEIVED' ? '#2563eb' : '#dc2626');
      rows += '<tr>' +
        '<td style="text-align: center;">' + (i + 1) + '</td>' +
        '<td><strong>' + it.documentType + '</strong>' + (it.required ? ' <span style="color:#dc2626;">*</span>' : '') + '</td>' +
        '<td style="text-align: center;"><span style="color:' + statusColor + '; font-weight: bold;">' + it.status + '</span></td>' +
        '<td style="text-align: center;">' + (it.receivedDate ? Utils.formatDateIndo(it.receivedDate) : '-') + '</td>' +
        '<td>' + (it.verifiedBy ? it.verifiedBy + ' (' + Utils.formatDateIndo(it.verifiedAt) + ')' : '-') + '</td>' +
        '<td>' + (it.note || '-') + '</td>' +
        '</tr>';
    }

    var body = '<table class="meta-table">' +
      '<tr>' +
      '<td class="meta-label">Nomor Perkara</td><td>: <strong>' + matter.matterNumber + '</strong></td>' +
      '<td class="meta-label">Klien</td><td>: <strong>' + (client ? client.name : matter.clientNameSnapshot) + '</strong></td>' +
      '</tr>' +
      '<tr>' +
      '<td class="meta-label">Judul / Objek</td><td>: ' + matter.title + '</td>' +
      '<td class="meta-label">PIC / Petugas</td><td>: ' + matter.assignedPIC + '</td>' +
      '</tr>' +
      '<tr>' +
      '<td class="meta-label">Kelengkapan Berkas</td><td>: <strong>' + stats.percentage + '% (' + stats.verifiedCount + '/' + stats.requiredTotal + ' Syarat Wajib Terverifikasi)</strong></td>' +
      '<td class="meta-label">Tahapan Saat Ini</td><td>: ' + matter.currentWorkflowStep + '</td>' +
      '</tr>' +
      '</table>' +

      '<table class="data-table">' +
      '<thead><tr><th style="width: 6%; text-align: center;">No</th><th>Jenis Dokumen Persyaratan</th><th style="width: 14%; text-align: center;">Status</th><th style="width: 14%; text-align: center;">Tgl Terima</th><th style="width: 22%;">Verifikator</th><th>Catatan</th></tr></thead>' +
      '<tbody>' + rows + '</tbody>' +
      '</table>';

    return this._buildDocumentShell('LEMBAR PEMERIKSAAN DOKUMEN (CHECKLIST)', body);
  },

  /**
   * Generates Task Sheet PDF HTML
   */
  generateTaskSheetHtml: function(taskId) {
    var task = Repository.Tasks.getById(taskId);
    if (!task) throw new Error('Tugas tidak ditemukan.');

    var matter = Repository.Matters.getById(task.matterId);
    var client = matter ? Repository.Clients.getById(matter.clientId) : null;

    var body = '<table class="meta-table">' +
      '<tr>' +
      '<td class="meta-label">Nomor Tugas</td><td>: <strong>' + task.taskNumber + '</strong></td>' +
      '<td class="meta-label">Nomor Perkara</td><td>: ' + (matter ? matter.matterNumber : '-') + '</td>' +
      '</tr>' +
      '<tr>' +
      '<td class="meta-label">Petugas PIC</td><td>: <strong>' + task.assignedTo + '</strong></td>' +
      '<td class="meta-label">Klien</td><td>: ' + (client ? client.name : (matter ? matter.clientNameSnapshot : '-')) + '</td>' +
      '</tr>' +
      '<tr>' +
      '<td class="meta-label">Prioritas</td><td>: <strong>' + task.priority + '</strong></td>' +
      '<td class="meta-label">Deadline</td><td>: <span style="color:#dc2626; font-weight: bold;">' + (task.deadline ? Utils.formatDateIndo(task.deadline) : '-') + '</span></td>' +
      '</tr>' +
      '<tr>' +
      '<td class="meta-label">Status Tugas</td><td>: <strong>' + task.status + ' (' + task.progress + '%)</strong></td>' +
      '<td class="meta-label">Diberikan Oleh</td><td>: ' + task.assignedBy + '</td>' +
      '</tr>' +
      '</table>' +

      '<div style="margin: 20px 0; padding: 15px; background-color: #f8fafc; border-left: 4px solid #0f172a; border-radius: 4px;">' +
      '<h4 style="margin: 0 0 8px 0; color: #0f172a;">Instruksi Tugas: ' + task.title + '</h4>' +
      '<p style="margin: 0; color: #334155; font-size: 13px;">' + (task.description || 'Tidak ada deskripsi detail tambahan.') + '</p>' +
      '</div>' +

      (task.notes ? '<div style="margin: 15px 0; padding: 12px; background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 4px; font-size: 12px;"><strong>Catatan Tambahan:</strong> ' + task.notes + '</div>' : '');

    return this._buildDocumentShell('LEMBAR PENUGASAN OPERASIONAL (TASK SHEET)', body);
  },

  /**
   * Converts HTML string to PDF Blob and saves into Document registry
   */
  renderPdfBlob: function(htmlContent, fileName) {
    if (Database.isMockMode()) {
      return {
        fileId: 'MOCK_PDF_' + new Date().getTime(),
        fileName: fileName || 'document.pdf',
        mock: true
      };
    }

    try {
      var blob = Utilities.newBlob(htmlContent, 'text/html', fileName + '.html').getAs('application/pdf').setName(fileName + '.pdf');
      var reportsFolderId = PropertiesService.getScriptProperties().getProperty('DRIVE_REPORTS_FOLDER_ID');
      var folder = reportsFolderId ? DriveApp.getFolderById(reportsFolderId) : DriveApp.getRootFolder();
      var file = folder.createFile(blob);
      return {
        fileId: file.getId(),
        fileUrl: file.getUrl(),
        fileName: file.getName()
      };
    } catch (e) {
      return {
        fileId: 'MOCK_PDF_FALLBACK',
        fileUrl: '#',
        fileName: fileName + '.pdf',
        error: e.message
      };
    }
  }
};
