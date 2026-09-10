/**
 * NOTARYGO™ — Notary Office Operational Control System
 * Database Layer & Google Sheets Abstraction with Concurrency Control
 */

var Database = (function() {
  var _mockMode = false;
  var _mockStore = {};

  /**
   * Enables or disables in-memory mock storage mode (for unit testing)
   * @param {boolean} enable
   */
  function setMockMode(enable) {
    _mockMode = enable;
    if (enable && Object.keys(_mockStore).length === 0) {
      resetMockStore();
    }
  }

  function isMockMode() {
    return _mockMode;
  }

  function resetMockStore() {
    _mockStore = {};
    for (var sheetName in SCHEMA) {
      _mockStore[sheetName] = [];
    }
  }

  function getMockStore() {
    return _mockStore;
  }

  /**
   * Resolves the active database Spreadsheet
   * @return {GoogleAppsScript.Spreadsheet.Spreadsheet}
   */
  function getSpreadsheet() {
    if (_mockMode) return null;
    var props = PropertiesService.getScriptProperties();
    var ssId = props.getProperty(CONFIG.KEYS.SPREADSHEET_ID);
    
    if (ssId) {
      try {
        return SpreadsheetApp.openById(ssId);
      } catch (e) {
        // Fallback to active spreadsheet if bound
      }
    }
    
    try {
      var activeSs = SpreadsheetApp.getActiveSpreadsheet();
      if (activeSs) {
        props.setProperty(CONFIG.KEYS.SPREADSHEET_ID, activeSs.getId());
        return activeSs;
      }
    } catch (e) {}

    return null;
  }

  /**
   * Executes a callback within a ScriptLock
   * @param {number} timeoutMs - Max lock wait time in ms (default 30000)
   * @param {Function} callback - Function to execute
   * @return {*} Callback return value
   */
  function withLock(timeoutMs, callback) {
    if (_mockMode) {
      return callback();
    }
    var lock = LockService.getScriptLock();
    var waitTime = timeoutMs || 30000;
    var acquired = false;
    try {
      acquired = lock.tryLock(waitTime);
      if (!acquired) {
        throw new Error('Gagal memperoleh kunci database (Lock Timeout). Silakan coba beberapa saat lagi.');
      }
      return callback();
    } finally {
      if (acquired) {
        try {
          lock.releaseLock();
        } catch (e) {}
      }
    }
  }

  /**
   * Ensures all canonical sheets and headers are initialized
   * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} [ss]
   * @return {Object} Status report
   */
  function setupDatabase(ss) {
    return withLock(30000, function() {
      if (_mockMode) {
        resetMockStore();
        return { success: true, createdSheets: Object.keys(SCHEMA), mock: true };
      }

      var targetSs = ss || getSpreadsheet();
      if (!targetSs) {
        // Create new spreadsheet if none exists
        targetSs = SpreadsheetApp.create('NOTARYGO™ — Operational Database');
        PropertiesService.getScriptProperties().setProperty(CONFIG.KEYS.SPREADSHEET_ID, targetSs.getId());
      }

      var created = [];
      var updated = [];

      for (var sheetName in SCHEMA) {
        var expectedHeaders = SCHEMA[sheetName];
        var sheet = targetSs.getSheetByName(sheetName);

        if (!sheet) {
          sheet = targetSs.insertSheet(sheetName);
          sheet.getRange(1, 1, 1, expectedHeaders.length).setValues([expectedHeaders]);
          sheet.getRange(1, 1, 1, expectedHeaders.length).setFontWeight('bold').setBackground('#0f172a').setFontColor('#ffffff');
          sheet.setFrozenRows(1);
          created.push(sheetName);
        } else {
          // Verify headers
          var lastCol = sheet.getLastColumn();
          if (lastCol === 0) {
            sheet.getRange(1, 1, 1, expectedHeaders.length).setValues([expectedHeaders]);
            sheet.getRange(1, 1, 1, expectedHeaders.length).setFontWeight('bold').setBackground('#0f172a').setFontColor('#ffffff');
            sheet.setFrozenRows(1);
            updated.push(sheetName);
          } else {
            var existingHeaders = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
            var missing = [];
            for (var i = 0; i < expectedHeaders.length; i++) {
              if (existingHeaders.indexOf(expectedHeaders[i]) === -1) {
                missing.push(expectedHeaders[i]);
              }
            }
            if (missing.length > 0) {
              // Append missing headers at the end
              var newRange = sheet.getRange(1, lastCol + 1, 1, missing.length);
              newRange.setValues([missing]);
              newRange.setFontWeight('bold').setBackground('#0f172a').setFontColor('#ffffff');
              updated.push(sheetName + ' (added ' + missing.join(', ') + ')');
            }
          }
        }
      }

      // Remove default 'Sheet1' if empty and extra sheets exist
      var defaultSheet = targetSs.getSheetByName('Sheet1') || targetSs.getSheetByName('Sheet 1');
      if (defaultSheet && targetSs.getSheets().length > 1 && defaultSheet.getLastRow() <= 1) {
        try {
          targetSs.deleteSheet(defaultSheet);
        } catch (e) {}
      }

      PropertiesService.getScriptProperties().setProperty(CONFIG.KEYS.SCHEMA_VERSION, CONFIG.SCHEMA_VERSION);
      PropertiesService.getScriptProperties().setProperty(CONFIG.KEYS.SYSTEM_INITIALIZED, 'true');

      return {
        success: true,
        spreadsheetId: targetSs.getId(),
        spreadsheetUrl: targetSs.getUrl(),
        createdSheets: created,
        updatedSheets: updated
      };
    });
  }

  /**
   * Reads all records from a specified sheet as array of objects
   * @param {string} sheetName
   * @return {Array<Object>}
   */
  function readAll(sheetName) {
    if (_mockMode) {
      return (_mockStore[sheetName] || []).map(function(item) {
        return Utils.deepClone(item);
      });
    }

    var ss = getSpreadsheet();
    if (!ss) return [];
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) return [];

    var lastRow = sheet.getLastRow();
    var lastCol = sheet.getLastColumn();
    if (lastRow <= 1 || lastCol === 0) return [];

    var data = sheet.getRange(1, 1, lastRow, lastCol).getValues();
    var headers = data[0];
    var results = [];

    for (var r = 1; r < data.length; r++) {
      var row = data[r];
      var rowObj = {};
      var hasData = false;
      for (var c = 0; c < headers.length; c++) {
        var key = headers[c];
        if (key) {
          var val = row[c];
          rowObj[key] = (val !== undefined && val !== null) ? val : '';
          if (rowObj[key] !== '') hasData = true;
        }
      }
      if (hasData) {
        results.push(rowObj);
      }
    }
    return results;
  }

  /**
   * Inserts a single record into a sheet
   * @param {string} sheetName
   * @param {Object} record
   * @return {Object} Inserted record
   */
  function insert(sheetName, record) {
    return withLock(15000, function() {
      if (_mockMode) {
        if (!_mockStore[sheetName]) _mockStore[sheetName] = [];
        var clone = Utils.deepClone(record);
        _mockStore[sheetName].push(clone);
        return clone;
      }

      var ss = getSpreadsheet();
      if (!ss) throw new Error('Database Spreadsheet tidak terhubung.');
      var sheet = ss.getSheetByName(sheetName);
      if (!sheet) throw new Error('Sheet ' + sheetName + ' tidak ditemukan.');

      var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn() || SCHEMA[sheetName].length).getValues()[0];
      var rowValues = [];
      for (var i = 0; i < headers.length; i++) {
        var val = record[headers[i]];
        rowValues.push(val !== undefined && val !== null ? val : '');
      }

      sheet.appendRow(rowValues);
      return record;
    });
  }

  /**
   * Inserts multiple records in batch into a sheet
   * @param {string} sheetName
   * @param {Array<Object>} records
   * @return {Array<Object>} Inserted records
   */
  function insertBatch(sheetName, records) {
    if (!records || records.length === 0) return [];
    return withLock(30000, function() {
      if (_mockMode) {
        if (!_mockStore[sheetName]) _mockStore[sheetName] = [];
        for (var k = 0; k < records.length; k++) {
          _mockStore[sheetName].push(Utils.deepClone(records[k]));
        }
        return records;
      }

      var ss = getSpreadsheet();
      if (!ss) throw new Error('Database Spreadsheet tidak terhubung.');
      var sheet = ss.getSheetByName(sheetName);
      if (!sheet) throw new Error('Sheet ' + sheetName + ' tidak ditemukan.');

      var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn() || SCHEMA[sheetName].length).getValues()[0];
      var batchRows = [];

      for (var r = 0; r < records.length; r++) {
        var rec = records[r];
        var rowValues = [];
        for (var i = 0; i < headers.length; i++) {
          var val = rec[headers[i]];
          rowValues.push(val !== undefined && val !== null ? val : '');
        }
        batchRows.push(rowValues);
      }

      var startRow = sheet.getLastRow() + 1;
      sheet.getRange(startRow, 1, batchRows.length, headers.length).setValues(batchRows);
      return records;
    });
  }

  /**
   * Updates an existing record matching a primary key
   * @param {string} sheetName
   * @param {string} keyField - E.g. 'matterId'
   * @param {*} keyValue - E.g. 'MAT_123'
   * @param {Object} updateFields - Fields to update
   * @return {Object|null} Updated record or null
   */
  function update(sheetName, keyField, keyValue, updateFields) {
    return withLock(15000, function() {
      if (_mockMode) {
        var store = _mockStore[sheetName] || [];
        for (var j = 0; j < store.length; j++) {
          if (String(store[j][keyField]) === String(keyValue)) {
            for (var f in updateFields) {
              store[j][f] = updateFields[f];
            }
            return Utils.deepClone(store[j]);
          }
        }
        return null;
      }

      var ss = getSpreadsheet();
      if (!ss) throw new Error('Database Spreadsheet tidak terhubung.');
      var sheet = ss.getSheetByName(sheetName);
      if (!sheet) throw new Error('Sheet ' + sheetName + ' tidak ditemukan.');

      var lastRow = sheet.getLastRow();
      var lastCol = sheet.getLastColumn();
      if (lastRow <= 1 || lastCol === 0) return null;

      var data = sheet.getRange(1, 1, lastRow, lastCol).getValues();
      var headers = data[0];
      var keyColIndex = headers.indexOf(keyField);
      if (keyColIndex === -1) throw new Error('Field ' + keyField + ' tidak ada di header sheet ' + sheetName);

      for (var r = 1; r < data.length; r++) {
        if (String(data[r][keyColIndex]) === String(keyValue)) {
          // Row found (1-based index is r + 1)
          var rowNum = r + 1;
          for (var field in updateFields) {
            var colIndex = headers.indexOf(field);
            if (colIndex !== -1) {
              data[r][colIndex] = updateFields[field];
              sheet.getRange(rowNum, colIndex + 1).setValue(updateFields[field]);
            }
          }
          // Build updated object
          var updatedObj = {};
          for (var c = 0; c < headers.length; c++) {
            updatedObj[headers[c]] = data[r][c];
          }
          return updatedObj;
        }
      }
      return null;
    });
  }

  /**
   * Deletes a record by keyField = keyValue from sheet
   * @param {string} sheetName
   * @param {string} keyField
   * @param {*} keyValue
   * @return {boolean} True if deleted, false otherwise
   */
  function deleteRow(sheetName, keyField, keyValue) {
    return withLock(30000, function() {
      if (_mockMode) {
        var store = _mockStore[sheetName] || [];
        var initialLen = store.length;
        _mockStore[sheetName] = store.filter(function(item) {
          return String(item[keyField]) !== String(keyValue);
        });
        return _mockStore[sheetName].length < initialLen;
      }

      var ss = getSpreadsheet();
      if (!ss) throw new Error('Database Spreadsheet tidak terhubung.');
      var sheet = ss.getSheetByName(sheetName);
      if (!sheet) throw new Error('Sheet ' + sheetName + ' tidak ditemukan.');

      var lastRow = sheet.getLastRow();
      var lastCol = sheet.getLastColumn();
      if (lastRow <= 1 || lastCol === 0) return false;

      var data = sheet.getRange(1, 1, lastRow, lastCol).getValues();
      var headers = data[0];
      var keyColIndex = headers.indexOf(keyField);
      if (keyColIndex === -1) throw new Error('Field ' + keyField + ' tidak ada di header sheet ' + sheetName);

      for (var r = 1; r < data.length; r++) {
        if (String(data[r][keyColIndex]) === String(keyValue)) {
          sheet.deleteRow(r + 1);
          return true;
        }
      }
      return false;
    });
  }

  /**
   * Clears all data rows from a sheet, preserving the header row
   * @param {string} sheetName
   * @return {boolean}
   */
  function clearSheetData(sheetName) {
    return withLock(30000, function() {
      if (_mockMode) {
        _mockStore[sheetName] = [];
        return true;
      }

      var ss = getSpreadsheet();
      if (!ss) throw new Error('Database Spreadsheet tidak terhubung.');
      var sheet = ss.getSheetByName(sheetName);
      if (!sheet) return false;

      var lastRow = sheet.getLastRow();
      var lastCol = sheet.getLastColumn();
      if (lastRow > 1 && lastCol > 0) {
        sheet.getRange(2, 1, lastRow - 1, lastCol).clearContent();
      }
      return true;
    });
  }

  /**
   * Purges all operational / transactional records (Matters, Tasks, Documents, Invoices, etc.)
   * Preserves: Office profile, Users, ServiceTypes, WorkflowTemplates, WorkflowSteps, Config
   */
  function purgeOperationalData() {
    var operationalSheets = [
      'Matters',
      'WorkflowHistory',
      'Tasks',
      'Pending',
      'FollowUps',
      'ChecklistItems',
      'Signings',
      'Invoices',
      'Payments',
      'Documents',
      'Approvals',
      'Communications',
      'ClientIntakes',
      'Notifications',
      'AuditLogs'
    ];

    var results = {};
    for (var i = 0; i < operationalSheets.length; i++) {
      var s = operationalSheets[i];
      clearSheetData(s);
      results[s] = true;
    }

    return {
      success: true,
      purgedSheets: operationalSheets,
      timestamp: Utils.nowIso()
    };
  }

  /**
   * Finds records by filter predicate function or key-value criteria
   * @param {string} sheetName
   * @param {Function|Object} criteria
   * @return {Array<Object>}
   */
  function find(sheetName, criteria) {
    var all = readAll(sheetName);
    if (!criteria) return all;

    if (typeof criteria === 'function') {
      return all.filter(criteria);
    }

    return all.filter(function(item) {
      for (var key in criteria) {
        if (String(item[key]) !== String(criteria[key])) {
          return false;
        }
      }
      return true;
    });
  }

  /**
   * Finds a single record by criteria
   * @param {string} sheetName
   * @param {Function|Object} criteria
   * @return {Object|null}
   */
  function findOne(sheetName, criteria) {
    var results = find(sheetName, criteria);
    return results.length > 0 ? results[0] : null;
  }

  return {
    setMockMode: setMockMode,
    isMockMode: isMockMode,
    resetMockStore: resetMockStore,
    getMockStore: getMockStore,
    getSpreadsheet: getSpreadsheet,
    withLock: withLock,
    setupDatabase: setupDatabase,
    readAll: readAll,
    insert: insert,
    insertBatch: insertBatch,
    update: update,
    deleteRow: deleteRow,
    clearSheetData: clearSheetData,
    purgeOperationalData: purgeOperationalData,
    find: find,
    findOne: findOne
  };
})();
