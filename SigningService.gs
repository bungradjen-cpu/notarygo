/**
 * NOTARYGO™ — Notary Office Operational Control System
 * Signing Schedule & Signing Readiness Engine
 */

var SigningService = {
  /**
   * Retrieves signing schedules with optional filters
   */
  getSignings: function(filter) {
    Security.requireAuth();
    filter = filter || {};
    var all = Repository.Signing.getAll();

    return all.filter(function(s) {
      if (filter.matterId && s.matterId !== filter.matterId) return false;
      if (filter.PIC && s.PIC.toLowerCase() !== filter.PIC.toLowerCase()) return false;
      if (filter.status && s.status !== filter.status) return false;
      return true;
    }).sort(function(a, b) {
      return (a.date || '').localeCompare(b.date || '');
    });
  },

  /**
   * Checks the readiness of a signing session
   * Verifies: Document completeness, draft approved, required parties
   */
  evaluateReadiness: function(signingId) {
    var signing = Repository.Signing.getById(signingId);
    if (!signing) throw new Error('Jadwal signing tidak ditemukan.');

    var matterId = signing.matterId;
    var checklistStats = ChecklistService.calculateCompleteness(matterId);
    
    // Check if there is an approved draft document
    var approvedDocs = Repository.Documents.find(function(d) {
      return d.matterId === matterId && (d.status === CONFIG.DOCUMENT_STATUS.APPROVED || d.status === CONFIG.DOCUMENT_STATUS.FINAL || d.status === CONFIG.DOCUMENT_STATUS.SIGNED);
    });

    var blockers = [];
    if (!checklistStats.isComplete) {
      blockers.push('Berkas persyaratan belum lengkap (Kelengkapan: ' + checklistStats.percentage + '%)');
    }
    if (approvedDocs.length === 0) {
      blockers.push('Draft akta final belum disetujui / approved');
    }

    var isReady = blockers.length === 0;
    var readinessStatus = isReady ? 'READY' : 'NOT_READY';

    // Update readiness status on signing record if changed
    if (signing.readinessStatus !== readinessStatus) {
      Repository.Signing.update(signingId, {
        readinessStatus: readinessStatus,
        updatedAt: Utils.nowIso()
      });
    }

    return {
      signingId: signingId,
      matterId: matterId,
      isReady: isReady,
      readinessStatus: readinessStatus,
      checklistPercentage: checklistStats.percentage,
      hasApprovedDraft: approvedDocs.length > 0,
      blockers: blockers
    };
  },

  /**
   * Schedules a new signing session
   */
  scheduleSigning: function(data, requestId) {
    var user = Security.requirePermission(Permissions.LIST.SIGNING_MANAGE);
    Validation.requireFields(data, ['matterId', 'date', 'startTime', 'participants']);

    var matter = Repository.Matters.getById(data.matterId);
    if (!matter) throw new Error('Perkara tidak ditemukan.');

    var signingId = Utils.generateId(CONFIG.PREFIX.SIGNING);

    var newSigning = {
      signingId: signingId,
      matterId: data.matterId,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime || '',
      location: data.location || 'Kantor Notaris & PPAT',
      participants: data.participants,
      PIC: data.PIC || user.email,
      status: CONFIG.SIGNING_STATUS.SCHEDULED,
      notes: data.notes || '',
      googleCalendarEventId: '',
      readinessStatus: 'NOT_READY',
      createdAt: Utils.nowIso(),
      updatedAt: Utils.nowIso()
    };

    var created = Repository.Signing.insert(newSigning);

    // Sync to Google Calendar if available
    try {
      var eventId = CalendarService.createSigningCalendarEvent(created, matter);
      if (eventId) {
        Repository.Signing.update(signingId, { googleCalendarEventId: eventId });
      }
    } catch (e) {}

    // Evaluate readiness right away
    SigningService.evaluateReadiness(signingId);

    AuditService.log({
      actorUserId: user.userId,
      actorEmail: user.email,
      action: 'SCHEDULE_SIGNING',
      entityType: 'SIGNING',
      entityId: created.signingId,
      afterSnapshot: created,
      description: 'Menjadwalkan penandatanganan akta untuk perkara ' + matter.matterNumber + ' pada ' + created.date + ' ' + created.startTime,
      requestId: requestId
    });

    return created;
  },

  /**
   * Updates signing status (e.g. READY, COMPLETED, RESCHEDULED, CANCELLED)
   */
  updateSigningStatus: function(signingId, status, notes, requestId) {
    var user = Security.requirePermission(Permissions.LIST.SIGNING_MANAGE);
    var target = Repository.Signing.getById(signingId);
    if (!target) throw new Error('Jadwal signing tidak ditemukan.');

    var updates = {
      status: status,
      notes: notes !== undefined ? notes : target.notes,
      updatedAt: Utils.nowIso()
    };

    var updated = Repository.Signing.update(signingId, updates);

    AuditService.log({
      actorUserId: user.userId,
      actorEmail: user.email,
      action: 'UPDATE_SIGNING_STATUS',
      entityType: 'SIGNING',
      entityId: signingId,
      beforeSnapshot: target,
      afterSnapshot: updated,
      description: 'Update status jadwal signing -> ' + status,
      requestId: requestId
    });

    return updated;
  }
};
