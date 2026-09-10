/**
 * NOTARYGO™ — Notary Office Operational Control System
 * Typed Domain Repositories
 */

var Repository = (function() {
  /**
   * Helper factory to create standard repository methods for any sheet
   */
  function createRepo(sheetName, idField) {
    return {
      getAll: function() {
        return Database.readAll(sheetName);
      },
      getById: function(id) {
        return Database.findOne(sheetName, function(item) {
          return String(item[idField]) === String(id);
        });
      },
      find: function(predicateOrCriteria) {
        return Database.find(sheetName, predicateOrCriteria);
      },
      findOne: function(predicateOrCriteria) {
        return Database.findOne(sheetName, predicateOrCriteria);
      },
      insert: function(record) {
        if (!record[idField]) {
          record[idField] = Utils.generateId(sheetName.substring(0, 3).toUpperCase() + '_');
        }
        return Database.insert(sheetName, record);
      },
      insertBatch: function(records) {
        return Database.insertBatch(sheetName, records);
      },
      update: function(id, updateFields) {
        return Database.update(sheetName, idField, id, updateFields);
      },
      delete: function(id) {
        return Database.deleteRow(sheetName, idField, id);
      },
      clearAll: function() {
        return Database.clearSheetData(sheetName);
      }
    };
  }

  return {
    Config: {
      get: function(key) {
        var rec = Database.findOne('Config', { key: key });
        return rec ? rec.value : null;
      },
      set: function(key, value, description, updatedBy) {
        var existing = Database.findOne('Config', { key: key });
        if (existing) {
          return Database.update('Config', 'key', key, {
            value: String(value),
            description: description || existing.description,
            updatedAt: Utils.nowIso(),
            updatedBy: updatedBy || 'SYSTEM'
          });
        } else {
          return Database.insert('Config', {
            key: key,
            value: String(value),
            description: description || '',
            updatedAt: Utils.nowIso(),
            updatedBy: updatedBy || 'SYSTEM'
          });
        }
      },
      getAll: function() {
        return Database.readAll('Config');
      }
    },
    Office: {
      getProfile: function() {
        var all = Database.readAll('Office');
        return all.length > 0 ? all[0] : null;
      },
      saveProfile: function(profileData, actorEmail) {
        var existing = this.getProfile();
        profileData.updatedAt = Utils.nowIso();
        profileData.updatedBy = actorEmail || 'SYSTEM';
        if (existing && existing.officeId) {
          return Database.update('Office', 'officeId', existing.officeId, profileData);
        } else {
          profileData.officeId = profileData.officeId || Utils.generateId('OFF_');
          return Database.insert('Office', profileData);
        }
      }
    },
    Users: createRepo('Users', 'userId'),
    Clients: createRepo('Clients', 'clientId'),
    ClientIntakes: createRepo('ClientIntakes', 'intakeId'),
    Organizations: createRepo('Organizations', 'organizationId'),
    ServiceTypes: createRepo('ServiceTypes', 'serviceTypeId'),
    WorkflowTemplates: createRepo('WorkflowTemplates', 'workflowId'),
    WorkflowSteps: createRepo('WorkflowSteps', 'stepId'),
    Matters: createRepo('Matters', 'matterId'),
    WorkflowHistory: createRepo('WorkflowHistory', 'workflowHistoryId'),
    Tasks: createRepo('Tasks', 'taskId'),
    Pending: createRepo('Pending', 'pendingId'),
    FollowUps: createRepo('FollowUps', 'followUpId'),
    ChecklistTemplates: createRepo('ChecklistTemplates', 'templateId'),
    ChecklistItems: createRepo('ChecklistItems', 'checklistItemId'),
    Documents: createRepo('Documents', 'documentId'),
    Approvals: createRepo('Approvals', 'approvalId'),
    Signing: createRepo('Signing', 'signingId'),
    Communications: createRepo('Communications', 'communicationId'),
    Invoices: createRepo('Invoices', 'invoiceId'),
    Payments: createRepo('Payments', 'paymentId'),
    Notifications: createRepo('Notifications', 'notificationId'),
    Alerts: createRepo('Alerts', 'alertId'),
    ActivityLogs: createRepo('ActivityLogs', 'logId'),
    Sequences: createRepo('Sequences', 'sequenceKey'),
    Backups: createRepo('Backups', 'backupId')
  };
})();
