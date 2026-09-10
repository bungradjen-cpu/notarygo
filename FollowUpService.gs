/**
 * NOTARYGO™ — Notary Office Operational Control System
 * Follow-Up & Client Communication Schedule Service
 */

var FollowUpService = {
  /**
   * Retrieves follow-up records with optional filters
   */
  getFollowUps: function(filter) {
    var user = Security.requireAuth();
    filter = filter || {};
    var all = Repository.FollowUps.getAll();

    return all.filter(function(f) {
      if (filter.matterId && f.matterId !== filter.matterId) return false;
      if (filter.PIC && f.PIC.toLowerCase() !== filter.PIC.toLowerCase()) return false;
      if (filter.status && f.status !== filter.status) return false;
      return true;
    }).sort(function(a, b) {
      return (a.followUpDate || '').localeCompare(b.followUpDate || '');
    });
  },

  /**
   * Schedules a new follow-up
   */
  createFollowUp: function(data, requestId) {
    var user = Security.requirePermission(Permissions.LIST.FOLLOW_UP_MANAGE);
    Validation.requireFields(data, ['matterId', 'targetName', 'followUpDate', 'method']);

    var matter = Repository.Matters.getById(data.matterId);
    if (!matter) throw new Error('Perkara tidak ditemukan.');

    var newFollowUp = {
      followUpId: Utils.generateId(CONFIG.PREFIX.FOLLOW_UP),
      matterId: data.matterId,
      targetType: data.targetType || 'CLIENT', // CLIENT, BANK, DEVELOPER, BPN, OTHER
      targetName: data.targetName.trim(),
      contact: data.contact || '',
      method: data.method, // WHATSAPP, PHONE, EMAIL, MEETING, OTHER
      followUpDate: data.followUpDate,
      result: data.result || '',
      nextFollowUpDate: data.nextFollowUpDate || '',
      PIC: data.PIC || user.email,
      status: CONFIG.FOLLOW_UP_STATUS.SCHEDULED,
      createdBy: user.email,
      createdAt: Utils.nowIso(),
      updatedAt: Utils.nowIso()
    };

    var created = Repository.FollowUps.insert(newFollowUp);

    Repository.Matters.update(data.matterId, {
      lastOperationalUpdate: Utils.nowIso(),
      updatedAt: Utils.nowIso(),
      updatedBy: user.email
    });

    AuditService.log({
      actorUserId: user.userId,
      actorEmail: user.email,
      action: 'CREATE_FOLLOW_UP',
      entityType: 'FOLLOW_UP',
      entityId: created.followUpId,
      afterSnapshot: created,
      description: 'Menjadwalkan follow-up untuk perkara ' + matter.matterNumber + ' kepada ' + created.targetName + ' via ' + created.method,
      requestId: requestId
    });

    return created;
  },

  /**
   * Updates follow-up result and marks DONE or RESCHEDULED
   */
  completeFollowUp: function(followUpId, result, nextDate, requestId) {
    var user = Security.requirePermission(Permissions.LIST.FOLLOW_UP_MANAGE);
    var target = Repository.FollowUps.getById(followUpId);
    if (!target) throw new Error('Follow-up tidak ditemukan.');

    var updates = {
      result: result || 'Selesai di-follow up.',
      status: nextDate ? CONFIG.FOLLOW_UP_STATUS.RESCHEDULED : CONFIG.FOLLOW_UP_STATUS.DONE,
      nextFollowUpDate: nextDate || '',
      updatedAt: Utils.nowIso()
    };

    var updated = Repository.FollowUps.update(followUpId, updates);

    // If nextDate is provided, automatically schedule next follow-up item
    if (nextDate) {
      Repository.FollowUps.insert({
        followUpId: Utils.generateId(CONFIG.PREFIX.FOLLOW_UP),
        matterId: target.matterId,
        targetType: target.targetType,
        targetName: target.targetName,
        contact: target.contact,
        method: target.method,
        followUpDate: nextDate,
        result: '',
        nextFollowUpDate: '',
        PIC: target.PIC,
        status: CONFIG.FOLLOW_UP_STATUS.SCHEDULED,
        createdBy: user.email,
        createdAt: Utils.nowIso(),
        updatedAt: Utils.nowIso()
      });
    }

    AuditService.log({
      actorUserId: user.userId,
      actorEmail: user.email,
      action: 'COMPLETE_FOLLOW_UP',
      entityType: 'FOLLOW_UP',
      entityId: followUpId,
      beforeSnapshot: target,
      afterSnapshot: updated,
      description: 'Menyelesaikan follow-up: ' + target.targetName + ' -> ' + updates.result,
      requestId: requestId
    });

    return updated;
  }
};
