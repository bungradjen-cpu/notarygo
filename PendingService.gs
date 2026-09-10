/**
 * NOTARYGO™ — Notary Office Operational Control System
 * Pending Control & Aging Management Service
 */

var PendingService = {
  /**
   * Retrieves all pending records
   */
  getAllPending: function() {
    Security.requireAuth();
    var all = Repository.Pending.getAll();
    var today = Utils.todayIsoDate();

    return all.map(function(p) {
      var days = p.pendingSince ? Utils.calculateDaysDiff(p.pendingSince, today) : 0;
      var matter = Repository.Matters.getById(p.matterId);
      return {
        pendingId: p.pendingId,
        matterId: p.matterId,
        matterNumber: matter ? matter.matterNumber : '-',
        clientName: matter ? matter.clientNameSnapshot : '-',
        title: matter ? matter.title : '-',
        reasonCode: p.reasonCode,
        reasonDetail: p.reasonDetail,
        pendingSince: p.pendingSince,
        pendingDays: days,
        expectedResumeDate: p.expectedResumeDate,
        responsibleParty: p.responsibleParty,
        PIC: p.PIC,
        nextFollowUp: p.nextFollowUp,
        status: p.status,
        resolvedAt: p.resolvedAt,
        resolvedBy: p.resolvedBy
      };
    }).sort(function(a, b) {
      return b.pendingDays - a.pendingDays;
    });
  },

  /**
   * Sets a Matter into PENDING state
   */
  setMatterPending: function(data, requestId) {
    var user = Security.requirePermission(Permissions.LIST.PENDING_MANAGE);
    Validation.validatePendingInput(data);

    var matter = Repository.Matters.getById(data.matterId);
    if (!matter) throw new Error('Perkara tidak ditemukan.');

    var pendingSince = data.pendingSince || Utils.todayIsoDate();
    var newPending = {
      pendingId: Utils.generateId(CONFIG.PREFIX.PENDING),
      matterId: data.matterId,
      reasonCode: data.reasonCode,
      reasonDetail: data.reasonDetail.trim(),
      pendingSince: pendingSince,
      expectedResumeDate: data.expectedResumeDate || '',
      responsibleParty: data.responsibleParty || data.reasonCode,
      PIC: data.PIC || matter.assignedPIC,
      nextFollowUp: data.nextFollowUp || '',
      status: 'ACTIVE',
      createdAt: Utils.nowIso(),
      resolvedAt: '',
      resolvedBy: ''
    };

    var createdPending = Repository.Pending.insert(newPending);

    // Update Matter status
    Repository.Matters.update(data.matterId, {
      matterStatus: CONFIG.MATTER_STATUS.PENDING,
      pendingStatus: 'PENDING',
      pendingReason: data.reasonCode + ': ' + data.reasonDetail,
      lastOperationalUpdate: Utils.nowIso(),
      updatedAt: Utils.nowIso(),
      updatedBy: user.email
    });

    AuditService.log({
      actorUserId: user.userId,
      actorEmail: user.email,
      action: 'SET_MATTER_PENDING',
      entityType: 'MATTER',
      entityId: data.matterId,
      afterSnapshot: createdPending,
      description: 'Menetapkan status PENDING pada perkara ' + matter.matterNumber + ' (' + data.reasonCode + ': ' + data.reasonDetail + ')',
      requestId: requestId
    });

    return createdPending;
  },

  /**
   * Resolves a pending status and returns Matter to ACTIVE
   */
  resolvePending: function(pendingId, note, requestId) {
    var user = Security.requirePermission(Permissions.LIST.PENDING_MANAGE);
    var pending = Repository.Pending.getById(pendingId);
    if (!pending) throw new Error('Catatan pending tidak ditemukan.');

    var updatedPending = Repository.Pending.update(pendingId, {
      status: 'RESOLVED',
      resolvedAt: Utils.nowIso(),
      resolvedBy: user.email
    });

    var matter = Repository.Matters.getById(pending.matterId);
    if (matter) {
      Repository.Matters.update(pending.matterId, {
        matterStatus: CONFIG.MATTER_STATUS.ACTIVE,
        pendingStatus: 'RESOLVED',
        pendingReason: '',
        lastOperationalUpdate: Utils.nowIso(),
        updatedAt: Utils.nowIso(),
        updatedBy: user.email
      });
    }

    AuditService.log({
      actorUserId: user.userId,
      actorEmail: user.email,
      action: 'RESOLVE_PENDING',
      entityType: 'PENDING',
      entityId: pendingId,
      afterSnapshot: updatedPending,
      description: 'Menyelesaikan status pending pada perkara ' + (matter ? matter.matterNumber : pending.matterId) + '. Catatan: ' + (note || '-'),
      requestId: requestId
    });

    return updatedPending;
  }
};
