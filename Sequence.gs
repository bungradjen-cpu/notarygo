/**
 * NOTARYGO™ — Notary Office Operational Control System
 * Sequence Engine & Atomic Running Numbers
 */

var Sequence = (function() {
  /**
   * Generates next atomic sequence number safely under LockService
   * @param {string} sequenceKey - E.g. 'MATTER', 'INVOICE', 'RECEIPT', 'TASK'
   * @param {string} [customPrefix] - E.g. 'NG', 'INV/NG', 'RCP/NG'
   * @param {number} [paddingLength] - Default 6 for matter, 5 for invoice
   * @return {string} Formatted running number
   */
  function getNextNumber(sequenceKey, customPrefix, paddingLength) {
    return Database.withLock(15000, function() {
      var currentYear = new Date().getFullYear();
      var key = sequenceKey.toUpperCase();
      var pad = paddingLength || (key === 'INVOICE' || key === 'RECEIPT' ? 5 : 6);
      
      var record = Repository.Sequences.getById(key);
      var nextNum = 1;

      if (record) {
        var recYear = parseInt(record.year, 10);
        var curNum = parseInt(record.currentNumber, 10) || 0;
        if (recYear === currentYear) {
          nextNum = curNum + 1;
        } else {
          // New year resets counter
          nextNum = 1;
        }

        Repository.Sequences.update(key, {
          currentNumber: nextNum,
          year: currentYear,
          paddingLength: pad,
          updatedAt: Utils.nowIso()
        });
      } else {
        Repository.Sequences.insert({
          sequenceKey: key,
          prefix: customPrefix || key,
          currentNumber: 1,
          paddingLength: pad,
          year: currentYear,
          updatedAt: Utils.nowIso()
        });
      }

      var padStr = ('00000000' + nextNum).slice(-pad);

      // Formatting logic based on sequence key
      if (key === 'MATTER') {
        var prefix = customPrefix || 'NG';
        return prefix + '-' + currentYear + '-' + padStr;
      } else if (key === 'INVOICE') {
        var invPrefix = customPrefix || 'INV/NG';
        return invPrefix + '/' + currentYear + '/' + padStr;
      } else if (key === 'RECEIPT') {
        var rcpPrefix = customPrefix || 'RCP/NG';
        return rcpPrefix + '/' + currentYear + '/' + padStr;
      } else if (key === 'TASK') {
        return 'TSK-' + currentYear + '-' + padStr;
      } else {
        return (customPrefix || key) + '-' + currentYear + '-' + padStr;
      }
    });
  }

  return {
    getNextNumber: getNextNumber,
    nextMatterNumber: function(prefix) {
      return getNextNumber('MATTER', prefix, 6);
    },
    nextInvoiceNumber: function(prefix) {
      return getNextNumber('INVOICE', prefix, 5);
    },
    nextReceiptNumber: function(prefix) {
      return getNextNumber('RECEIPT', prefix, 5);
    },
    nextTaskNumber: function() {
      return getNextNumber('TASK', 'TSK', 6);
    }
  };
})();
