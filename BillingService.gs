/**
 * NOTARYGO™ — Notary Office Operational Control System
 * Billing, Invoice & Payment Management Engine
 */

var BillingService = {
  /**
   * Retrieves all invoices with optional filters
   */
  getInvoices: function(filter) {
    Security.requirePermission(Permissions.LIST.FINANCE_VIEW_ALL);
    filter = filter || {};
    var all = Repository.Invoices.getAll();

    return all.filter(function(inv) {
      if (filter.matterId && inv.matterId !== filter.matterId) return false;
      if (filter.clientId && inv.clientId !== filter.clientId) return false;
      if (filter.status && inv.status !== filter.status) return false;
      return true;
    }).sort(function(a, b) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  },

  /**
   * Gets invoice detail with payments history
   */
  getInvoiceDetail: function(invoiceId) {
    Security.requirePermission(Permissions.LIST.FINANCE_VIEW_ALL);
    var invoice = Repository.Invoices.getById(invoiceId);
    if (!invoice) throw new Error('Invoice tidak ditemukan.');

    var payments = Repository.Payments.find({ invoiceId: invoiceId }).sort(function(a, b) {
      return new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime();
    });

    var matter = Repository.Matters.getById(invoice.matterId);
    var client = Repository.Clients.getById(invoice.clientId);
    var office = OfficeService.getProfile();

    return {
      invoice: invoice,
      payments: payments,
      matter: matter,
      client: client,
      office: office
    };
  },

  /**
   * Creates a new Invoice with authoritative backend money calculations
   */
  createInvoice: function(data, requestId) {
    var user = Security.requirePermission(Permissions.LIST.FINANCE_MANAGE_INVOICE);
    Validation.validateInvoiceInput(data);

    var matter = Repository.Matters.getById(data.matterId);
    if (!matter) throw new Error('Perkara tidak ditemukan.');

    var client = Repository.Clients.getById(data.clientId);
    if (!client) throw new Error('Client tidak ditemukan.');

    // Calculate items
    var rawItems = Array.isArray(data.items) ? data.items : Utils.safeJsonParse(data.itemsJson, []);
    if (!rawItems || rawItems.length === 0) {
      rawItems = [
        { description: 'Biaya Jasa Notaris / PPAT - ' + matter.title, amount: Utils.parseCurrency(data.total || data.subtotal || 0) }
      ];
    }

    var subtotal = 0;
    var validatedItems = [];
    for (var i = 0; i < rawItems.length; i++) {
      var itemAmt = Utils.parseCurrency(rawItems[i].amount);
      subtotal += itemAmt;
      validatedItems.push({
        description: rawItems[i].description || ('Item ' + (i + 1)),
        amount: itemAmt
      });
    }

    var discount = Utils.parseCurrency(data.discount || 0);
    var tax = Utils.parseCurrency(data.tax || 0);
    var total = Math.max(0, subtotal - discount + tax);
    var paidAmount = 0;
    var outstanding = total;

    var office = OfficeService.getProfile();
    var invPrefix = (office && office.invoicePrefix) ? office.invoicePrefix : 'INV/NG';
    var invoiceNumber = Sequence.nextInvoiceNumber(invPrefix);

    var newInvoice = {
      invoiceId: Utils.generateId(CONFIG.PREFIX.INVOICE),
      invoiceNumber: invoiceNumber,
      matterId: data.matterId,
      clientId: data.clientId,
      invoiceDate: data.invoiceDate,
      dueDate: data.dueDate,
      itemsJson: Utils.safeJsonStringify(validatedItems),
      subtotal: subtotal,
      discount: discount,
      tax: tax,
      total: total,
      paidAmount: paidAmount,
      outstanding: outstanding,
      status: CONFIG.INVOICE_STATUS.ISSUED,
      notes: data.notes || '',
      pdfFileId: '',
      createdBy: user.email,
      createdAt: Utils.nowIso(),
      updatedAt: Utils.nowIso()
    };

    var created = Repository.Invoices.insert(newInvoice);

    // Update Matter financial status
    Repository.Matters.update(data.matterId, {
      financialStatus: 'BILLED',
      lastOperationalUpdate: Utils.nowIso(),
      updatedAt: Utils.nowIso(),
      updatedBy: user.email
    });

    AuditService.log({
      actorUserId: user.userId,
      actorEmail: user.email,
      action: 'CREATE_INVOICE',
      entityType: 'INVOICE',
      entityId: created.invoiceId,
      afterSnapshot: created,
      description: 'Menerbitkan tagihan ' + created.invoiceNumber + ' sejumlah ' + Utils.formatCurrency(created.total) + ' untuk perkara ' + matter.matterNumber,
      requestId: requestId
    });

    return created;
  },

  /**
   * Records a payment against an invoice safely with concurrency locking
   */
  recordPayment: function(data, requestId) {
    var user = Security.requirePermission(Permissions.LIST.FINANCE_RECORD_PAYMENT);

    return Database.withLock(15000, function() {
      var invoice = Repository.Invoices.getById(data.invoiceId);
      if (!invoice) throw new Error('Invoice tidak ditemukan.');

      Validation.validatePaymentInput(data, invoice.outstanding);

      var paymentAmount = Utils.parseCurrency(data.amount);
      var currentPaid = Utils.parseCurrency(invoice.paidAmount);
      var currentTotal = Utils.parseCurrency(invoice.total);

      var newPaidAmount = currentPaid + paymentAmount;
      var newOutstanding = Math.max(0, currentTotal - newPaidAmount);

      var newStatus = CONFIG.INVOICE_STATUS.PARTIAL;
      if (newOutstanding === 0) {
        newStatus = CONFIG.INVOICE_STATUS.PAID;
      }

      var office = OfficeService.getProfile();
      var receiptPrefix = (office && office.invoicePrefix ? office.invoicePrefix.replace('INV', 'RCP') : 'RCP/NG');
      var receiptNumber = Sequence.nextReceiptNumber(receiptPrefix);

      var newPayment = {
        paymentId: Utils.generateId(CONFIG.PREFIX.PAYMENT),
        invoiceId: data.invoiceId,
        matterId: invoice.matterId,
        paymentDate: data.paymentDate || Utils.todayIsoDate(),
        amount: paymentAmount,
        method: data.method || 'TRANSFER_BANK', // TRANSFER_BANK, TUNAI, GIRO, OTHER
        reference: data.reference || '',
        receivedBy: user.email,
        receiptNumber: receiptNumber,
        notes: data.notes || '',
        createdAt: Utils.nowIso(),
        createdBy: user.email
      };

      var createdPayment = Repository.Payments.insert(newPayment);

      // Update Invoice totals & status
      Repository.Invoices.update(data.invoiceId, {
        paidAmount: newPaidAmount,
        outstanding: newOutstanding,
        status: newStatus,
        updatedAt: Utils.nowIso()
      });

      // Update Matter financial status
      var matterFinancialStatus = (newStatus === CONFIG.INVOICE_STATUS.PAID) ? 'PAID' : 'PARTIAL';
      Repository.Matters.update(invoice.matterId, {
        financialStatus: matterFinancialStatus,
        lastOperationalUpdate: Utils.nowIso(),
        updatedAt: Utils.nowIso(),
        updatedBy: user.email
      });

      AuditService.log({
        actorUserId: user.userId,
        actorEmail: user.email,
        action: 'RECORD_PAYMENT',
        entityType: 'PAYMENT',
        entityId: createdPayment.paymentId,
        afterSnapshot: createdPayment,
        description: 'Mencatat pembayaran ' + Utils.formatCurrency(paymentAmount) + ' (Kuitansi: ' + receiptNumber + ') untuk tagihan ' + invoice.invoiceNumber + ' -> Status: ' + newStatus,
        requestId: requestId
      });

      return {
        payment: createdPayment,
        invoiceStatus: newStatus,
        outstanding: newOutstanding
      };
    });
  },

  /**
   * Updates an invoice (allowed only if no payments have been made)
   */
  updateInvoice: function(invoiceId, data, requestId) {
    var user = Security.requirePermission(Permissions.LIST.FINANCE_MANAGE_INVOICE);
    var target = Repository.Invoices.getById(invoiceId);
    if (!target) throw new Error('Invoice tidak ditemukan.');

    if (target.paidAmount > 0) {
      throw new Error('Invoice yang sudah memiliki pembayaran tidak dapat diedit. Buat invoice revisi atau hapus pembayaran terlebih dahulu.');
    }

    var updates = {};
    if (data.invoiceDate !== undefined) updates.invoiceDate = data.invoiceDate;
    if (data.dueDate !== undefined) updates.dueDate = data.dueDate;
    if (data.notes !== undefined) updates.notes = data.notes;

    if (data.items || data.itemsJson || data.discount !== undefined || data.tax !== undefined) {
      var rawItems = data.items || (data.itemsJson ? Utils.safeJsonParse(data.itemsJson, []) : Utils.safeJsonParse(target.itemsJson, []));
      var subtotal = 0;
      var validatedItems = [];
      for (var i = 0; i < rawItems.length; i++) {
        var itemAmt = Utils.parseCurrency(rawItems[i].amount);
        subtotal += itemAmt;
        validatedItems.push({
          description: rawItems[i].description || ('Item ' + (i + 1)),
          amount: itemAmt
        });
      }

      var discount = data.discount !== undefined ? Utils.parseCurrency(data.discount) : target.discount;
      var tax = data.tax !== undefined ? Utils.parseCurrency(data.tax) : target.tax;
      var total = Math.max(0, subtotal - discount + tax);
      
      updates.itemsJson = Utils.safeJsonStringify(validatedItems);
      updates.subtotal = subtotal;
      updates.discount = discount;
      updates.tax = tax;
      updates.total = total;
      updates.outstanding = total; // Since paidAmount is 0
    }

    updates.updatedAt = Utils.nowIso();

    var updated = Repository.Invoices.update(invoiceId, updates);

    AuditService.log({
      actorUserId: user.userId,
      actorEmail: user.email,
      action: 'UPDATE_INVOICE',
      entityType: 'INVOICE',
      entityId: invoiceId,
      beforeSnapshot: target,
      afterSnapshot: updated,
      description: 'Memperbarui tagihan ' + target.invoiceNumber,
      requestId: requestId
    });

    return updated;
  },

  /**
   * Deletes an invoice (allowed only if no payments have been made)
   */
  deleteInvoice: function(invoiceId, requestId) {
    var user = Security.requirePermission(Permissions.LIST.FINANCE_MANAGE_INVOICE);
    var target = Repository.Invoices.getById(invoiceId);
    if (!target) throw new Error('Invoice tidak ditemukan.');

    if (target.paidAmount > 0) {
      throw new Error('Invoice yang sudah dibayar tidak dapat dihapus. Silakan kembalikan dana dan hapus pembayaran terlebih dahulu.');
    }

    var success = Repository.Invoices.delete(invoiceId);

    // If matter has no other invoices, revert financialStatus
    var matterInvoices = Repository.Invoices.find({ matterId: target.matterId });
    if (matterInvoices.length === 0) {
      Repository.Matters.update(target.matterId, {
        financialStatus: 'UNBILLED',
        updatedAt: Utils.nowIso(),
        updatedBy: user.email
      });
    }

    AuditService.log({
      actorUserId: user.userId,
      actorEmail: user.email,
      action: 'DELETE_INVOICE',
      entityType: 'INVOICE',
      entityId: invoiceId,
      beforeSnapshot: target,
      description: 'Menghapus tagihan: ' + target.invoiceNumber,
      requestId: requestId
    });

    return { success: success, message: 'Tagihan ' + target.invoiceNumber + ' berhasil dihapus.' };
  }
};
