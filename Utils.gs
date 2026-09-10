/**
 * NOTARYGO™ — Notary Office Operational Control System
 * Utility Functions & Standard Response Builders
 */

var Utils = {
  /**
   * Generates a unique immutable technical ID with prefix
   * @param {string} prefix - Entity prefix (e.g. 'MAT_', 'USR_')
   * @return {string} Unique ID
   */
  generateId: function(prefix) {
    prefix = prefix || 'ID_';
    var timestamp = new Date().getTime().toString(36).toUpperCase();
    var randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    return prefix + timestamp + '_' + randomPart;
  },

  /**
   * Generates request ID for tracing and idempotency
   * @return {string} Request ID (e.g. 'REQ_...')
   */
  generateRequestId: function() {
    return 'REQ_' + new Date().getTime().toString(36).toUpperCase() + '_' + Math.random().toString(36).substring(2, 6).toUpperCase();
  },

  /**
   * Returns current timestamp ISO string in Asia/Jakarta timezone
   * @return {string} ISO Date String
   */
  nowIso: function() {
    return new Date().toISOString();
  },

  /**
   * Returns current formatted date (YYYY-MM-DD)
   * @param {Date} [d] - Date object
   * @return {string} YYYY-MM-DD
   */
  todayIsoDate: function(d) {
    var date = d || new Date();
    var year = date.getFullYear();
    var month = ('0' + (date.getMonth() + 1)).slice(-2);
    var day = ('0' + date.getDate()).slice(-2);
    return year + '-' + month + '-' + day;
  },

  /**
   * Calculates difference in days between two date strings (YYYY-MM-DD or ISO)
   * @param {string|Date} date1
   * @param {string|Date} date2
   * @return {number} Days difference (date2 - date1)
   */
  calculateDaysDiff: function(date1, date2) {
    if (!date1 || !date2) return 0;
    var d1 = new Date(date1);
    var d2 = new Date(date2);
    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);
    var diffTime = d2.getTime() - d1.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  },

  /**
   * Formats number into Indonesian Rupiah currency string
   * @param {number} amount
   * @return {string} E.g. "Rp 15.000.000"
   */
  formatCurrency: function(amount) {
    var val = Math.round(Number(amount) || 0);
    return 'Rp ' + val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  },

  /**
   * Parses integer amount in Rupiah safely
   * @param {*} val
   * @return {number}
   */
  parseCurrency: function(val) {
    if (typeof val === 'number') return Math.max(0, Math.round(val));
    if (!val) return 0;
    var cleaned = val.toString().replace(/[^0-9.-]/g, '');
    var parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : Math.max(0, Math.round(parsed));
  },

  /**
   * Formats ISO date to Indonesian readable format (e.g. 26 Ags 2026)
   * @param {string|Date} dateVal
   * @return {string}
   */
  formatDateIndo: function(dateVal) {
    if (!dateVal) return '-';
    var d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
  },

  /**
   * Standard Success Response Builder
   * @param {*} data
   * @param {string} [message]
   * @param {string} [requestId]
   * @return {Object}
   */
  createResponse: function(data, message, requestId) {
    return {
      success: true,
      data: data !== undefined ? data : null,
      message: message || 'Operasi berhasil diselesaikan.',
      requestId: requestId || Utils.generateRequestId(),
      timestamp: Utils.nowIso()
    };
  },

  /**
   * Standard Error Response Builder
   * @param {string} code - Error code (e.g. 'MATTER_NOT_FOUND')
   * @param {string} message - Human readable error message
   * @param {string} [requestId]
   * @param {*} [details]
   * @return {Object}
   */
  createErrorResponse: function(code, message, requestId, details) {
    return {
      success: false,
      code: code || 'INTERNAL_ERROR',
      message: message || 'Terjadi kesalahan pada sistem.',
      requestId: requestId || Utils.generateRequestId(),
      details: details || null,
      timestamp: Utils.nowIso()
    };
  },

  /**
   * Safe JSON parse with fallback
   */
  safeJsonParse: function(str, fallback) {
    if (str === null || str === undefined || str === '') return fallback;
    try {
      return JSON.parse(str);
    } catch (e) {
      return fallback;
    }
  },

  /**
   * Safe JSON stringify with fallback
   */
  safeJsonStringify: function(obj, fallback) {
    try {
      return JSON.stringify(obj);
    } catch (e) {
      return fallback || '{}';
    }
  },

  /**
   * Generates a random salt string
   * @return {string}
   */
  generateSalt: function() {
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var salt = '';
    for (var i = 0; i < 16; i++) {
      salt += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return salt;
  },

  /**
   * Computes SHA-256 salted password hash
   * @param {string} password
   * @param {string} salt
   * @return {string}
   */
  hashPassword: function(password, salt) {
    if (!password) return '';
    var input = String(password) + ':' + String(salt || '');
    if (typeof Utilities !== 'undefined' && Utilities.computeDigest && Utilities.DigestAlgorithm) {
      var charset = (Utilities.Charset && Utilities.Charset.UTF_8) ? Utilities.Charset.UTF_8 : undefined;
      var digest = charset ? Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, input, charset) : Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, input);
      var hex = '';
      for (var i = 0; i < digest.length; i++) {
        var byteVal = digest[i];
        if (byteVal < 0) byteVal += 256;
        var byteHex = byteVal.toString(16);
        if (byteHex.length === 1) byteHex = '0' + byteHex;
        hex += byteHex;
      }
      return hex;
    }
    try {
      var crypto = require('crypto');
      return crypto.createHash('sha256').update(input, 'utf8').digest('hex');
    } catch (e) {
      var hash = 0;
      for (var j = 0; j < input.length; j++) {
        hash = ((hash << 5) - hash) + input.charCodeAt(j);
        hash |= 0;
      }
      return Math.abs(hash).toString(16);
    }
  },

  /**
   * Deep clone object
   */
  deepClone: function(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    return JSON.parse(JSON.stringify(obj));
  },

  /**
   * Sanitizes string against HTML injection
   */
  sanitizeString: function(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
};
