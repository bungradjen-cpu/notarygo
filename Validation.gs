/**
 * NOTARYGO™ — Notary Office Operational Control System
 * Server-Side Validation Engine
 */

var Validation = {
  /**
   * Validates email format
   */
  isValidEmail: function(email) {
    if (!email || typeof email !== 'string') return false;
    var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.trim());
  },

  /**
   * Validates date format (YYYY-MM-DD or valid ISO string)
   */
  isValidDate: function(dateStr) {
    if (!dateStr) return false;
    var d = new Date(dateStr);
    return !isNaN(d.getTime());
  },

  /**
   * Validates non-empty string
   */
  isNonEmptyString: function(val) {
    return typeof val === 'string' && val.trim().length > 0;
  },

  /**
   * Validates positive currency amount
   */
  isPositiveAmount: function(val) {
    var num = Number(val);
    return !isNaN(num) && num > 0;
  },

  /**
   * Validates non-negative currency amount
   */
  isNonNegativeAmount: function(val) {
    var num = Number(val);
    return !isNaN(num) && num >= 0;
  },

  /**
   * Validates role name
   */
  isValidRole: function(role) {
    return [
      CONFIG.ROLES.OWNER,
      CONFIG.ROLES.ADMIN,
      CONFIG.ROLES.SUPERVISOR,
      CONFIG.ROLES.STAFF,
      CONFIG.ROLES.FINANCE
    ].indexOf(role) !== -1;
  },

  /**
   * Validates required fields in an object payload
   * @param {Object} obj
   * @param {Array<string>} requiredFields
   * @throws {Error} If any field is missing
   */
  requireFields: function(obj, requiredFields) {
    if (!obj || typeof obj !== 'object') {
      throw new Error('Payload data tidak valid atau kosong.');
    }
    var missing = [];
    for (var i = 0; i < requiredFields.length; i++) {
      var field = requiredFields[i];
      if (obj[field] === undefined || obj[field] === null || String(obj[field]).trim() === '') {
        missing.push(field);
      }
    }
    if (missing.length > 0) {
      throw new Error('Field wajib belum diisi: ' + missing.join(', '));
    }
  },

  /**
   * Validates Matter payload on creation
   */
  validateMatterInput: function(data) {
    this.requireFields(data, ['clientId', 'serviceTypeId', 'title']);
    if (data.deadline && !this.isValidDate(data.deadline)) {
      throw new Error('Format tanggal deadline tidak valid.');
    }
  },

  /**
   * Validates Task payload
   */
  validateTaskInput: function(data) {
    this.requireFields(data, ['matterId', 'title', 'assignedTo']);
    if (data.priority && [CONFIG.TASK_PRIORITY.LOW, CONFIG.TASK_PRIORITY.MEDIUM, CONFIG.TASK_PRIORITY.HIGH, CONFIG.TASK_PRIORITY.CRITICAL].indexOf(data.priority) === -1) {
      throw new Error('Tingkat prioritas task tidak valid.');
    }
    if (data.deadline && !this.isValidDate(data.deadline)) {
      throw new Error('Format tanggal deadline task tidak valid.');
    }
  },

  /**
   * Validates Pending record
   */
  validatePendingInput: function(data) {
    this.requireFields(data, ['matterId', 'reasonCode', 'reasonDetail', 'PIC']);
    if (CONFIG.PENDING_REASON_CODES.indexOf(data.reasonCode) === -1) {
      throw new Error('Kode alasan pending tidak valid: ' + data.reasonCode);
    }
  },

  /**
   * Validates Invoice input
   */
  validateInvoiceInput: function(data) {
    this.requireFields(data, ['matterId', 'clientId', 'invoiceDate', 'dueDate']);
    if (!this.isValidDate(data.invoiceDate) || !this.isValidDate(data.dueDate)) {
      throw new Error('Format tanggal invoice atau jatuh tempo tidak valid.');
    }
  },

  /**
   * Validates Payment input
   */
  validatePaymentInput: function(data, outstandingAmount) {
    this.requireFields(data, ['invoiceId', 'paymentDate', 'amount', 'method']);
    var amt = Utils.parseCurrency(data.amount);
    if (amt <= 0) {
      throw new Error('Nominal pembayaran harus lebih besar dari 0.');
    }
    if (outstandingAmount !== undefined && amt > outstandingAmount && !data.overrideExcess) {
      throw new Error('Nominal pembayaran (Rp ' + amt.toLocaleString('id-ID') + ') melebihi sisa tagihan (Rp ' + outstandingAmount.toLocaleString('id-ID') + ').');
    }
  }
};
