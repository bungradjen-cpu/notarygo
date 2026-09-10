/**
 * NOTARYGO™ — Notary Office Operational Control System
 * Append-Only Audit & Activity Logging Engine
 */

var AuditService = (function() {
  /**
   * Records an immutable audit log entry
   * @param {Object} entry
   * @param {string} [entry.actorUserId]
   * @param {string} [entry.actorEmail]
   * @param {string} entry.action - E.g. 'CREATE_MATTER', 'CANCEL_MATTER', 'WORKFLOW_TRANSITION'
   * @param {string} entry.entityType - E.g. 'MATTER', 'TASK', 'INVOICE', 'USER'
   * @param {string} entry.entityId - E.g. 'MAT_123'
   * @param {Object|string} [entry.beforeSnapshot]
   * @param {Object|string} [entry.afterSnapshot]
   * @param {string} entry.description
   * @param {string} [entry.requestId]
   * @return {Object} Inserted log record
   */
  function log(entry) {
    if (!entry) return null;

    var logRecord = {
      logId: Utils.generateId(CONFIG.PREFIX.LOG),
      actorUserId: entry.actorUserId || 'SYSTEM',
      actorEmail: entry.actorEmail || 'system@notarygo.internal',
      action: entry.action || 'UNKNOWN_ACTION',
      entityType: entry.entityType || 'GENERAL',
      entityId: entry.entityId || '-',
      beforeSnapshot: typeof entry.beforeSnapshot === 'object' ? Utils.safeJsonStringify(entry.beforeSnapshot) : (entry.beforeSnapshot || ''),
      afterSnapshot: typeof entry.afterSnapshot === 'object' ? Utils.safeJsonStringify(entry.afterSnapshot) : (entry.afterSnapshot || ''),
      description: entry.description || '',
      timestamp: Utils.nowIso(),
      requestId: entry.requestId || Utils.generateRequestId()
    };

    return Repository.ActivityLogs.insert(logRecord);
  }

  /**
   * Retrieves activity logs with flexible filters and pagination
   * @param {Object} [filter]
   * @param {string} [filter.entityType]
   * @param {string} [filter.entityId]
   * @param {string} [filter.action]
   * @param {string} [filter.actorEmail]
   * @param {number} [filter.limit] - Default 100
   * @param {number} [filter.offset] - Default 0
   * @return {Object} { logs: Array, total: number }
   */
  function getLogs(filter) {
    filter = filter || {};
    var all = Repository.ActivityLogs.getAll();

    // Sort descending by timestamp
    all.sort(function(a, b) {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    var filtered = all.filter(function(item) {
      if (filter.entityType && item.entityType !== filter.entityType) return false;
      if (filter.entityId && item.entityId !== filter.entityId) return false;
      if (filter.action && item.action !== filter.action) return false;
      if (filter.actorEmail && item.actorEmail.toLowerCase().indexOf(filter.actorEmail.toLowerCase()) === -1) return false;
      return true;
    });

    var limit = filter.limit || 100;
    var offset = filter.offset || 0;
    var paginated = filtered.slice(offset, offset + limit);

    return {
      logs: paginated,
      total: filtered.length,
      limit: limit,
      offset: offset
    };
  }

  return {
    log: log,
    getLogs: getLogs
  };
})();
