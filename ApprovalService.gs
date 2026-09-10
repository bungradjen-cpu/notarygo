/**
 * NOTARYGO™ — Notary Office Operational Control System
 * Multi-Stage Approval & Revision Workflow Engine
 */

var ApprovalService = {
  /**
   * Retrieves all approvals with optional filters
   */
  getApprovals: function(filter) {
    Security.requireAuth();
    filter = filter || {};
    var all = Repository.Approvals.getAll();

    return all.filter(function(a) {
      if (filter.matterId && a.matterId !== filter.matterId) return false;
      if (filter.reviewer && a.reviewer.toLowerCase() !== filter.reviewer.toLowerCase()) return false;
      if (filter.status && a.status !== filter.status) return false;
      return true;
    }).sort(function(a, b) {
      return new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime();
    });
  },

  /**
   * Submits an entity for approval/review
   */
  requestApproval: function(data, requestId) {
    var user = Security.requireAuth();
    Validation.requireFields(data, ['matterId', 'entityType', 'entityId', 'reviewer']);

    var newApproval = {
      approvalId: Utils.generateId(CONFIG.PREFIX.APPROVAL),
      matterId: data.matterId,
      entityType: data.entityType, // DRAFT, INVOICE, MATTER_COMPLETION
      entityId: data.entityId,
      requestedBy: user.email,
      reviewer: data.reviewer.toLowerCase().trim(),
      status: CONFIG.APPROVAL_STATUS.WAITING,
      requestDate: Utils.nowIso(),
      reviewDate: '',
      comment: data.comment || ''
    };

    var created = Repository.Approvals.insert(newApproval);

    // Update Matter to WAITING_APPROVAL if applicable
    var matter = Repository.Matters.getById(data.matterId);
    if (matter && matter.matterStatus === CONFIG.MATTER_STATUS.ACTIVE) {
      Repository.Matters.update(data.matterId, {
        matterStatus: CONFIG.MATTER_STATUS.WAITING_APPROVAL,
        lastOperationalUpdate: Utils.nowIso(),
        updatedAt: Utils.nowIso(),
        updatedBy: user.email
      });
    }

    AuditService.log({
      actorUserId: user.userId,
      actorEmail: user.email,
      action: 'REQUEST_APPROVAL',
      entityType: 'APPROVAL',
      entityId: created.approvalId,
      afterSnapshot: created,
      description: 'Mengajukan review/approval ' + created.entityType + ' ke ' + created.reviewer,
      requestId: requestId
    });

    // Send notification to reviewer
    NotificationService.queueNotification({
      recipientEmail: created.reviewer,
      type: 'APPROVAL_WAITING',
      entityType: 'APPROVAL',
      entityId: created.approvalId,
      subject: '[NOTARYGO] Permohonan Review & Approval Baru: ' + (matter ? matter.matterNumber : data.entityId),
      payload: {
        entityType: created.entityType,
        matterNumber: matter ? matter.matterNumber : '-',
        requestedBy: user.email,
        comment: created.comment
      }
    });

    return created;
  },

  /**
   * Responds to an approval request (APPROVED / REVISION_REQUESTED / REJECTED)
   */
  respondApproval: function(approvalId, decision, comment, requestId) {
    var user = Security.requirePermission(Permissions.LIST.APPROVAL_REVIEW);
    var target = Repository.Approvals.getById(approvalId);
    if (!target) throw new Error('Permohonan approval tidak ditemukan.');

    if ([CONFIG.APPROVAL_STATUS.APPROVED, CONFIG.APPROVAL_STATUS.REVISION_REQUESTED, CONFIG.APPROVAL_STATUS.REJECTED].indexOf(decision) === -1) {
      throw new Error('Keputusan approval tidak valid: ' + decision);
    }

    var updates = {
      status: decision,
      reviewDate: Utils.nowIso(),
      comment: comment || ''
    };

    var updated = Repository.Approvals.update(approvalId, updates);

    // Reset Matter status back to ACTIVE if approved or revision requested
    var matter = Repository.Matters.getById(target.matterId);
    if (matter && matter.matterStatus === CONFIG.MATTER_STATUS.WAITING_APPROVAL) {
      Repository.Matters.update(target.matterId, {
        matterStatus: CONFIG.MATTER_STATUS.ACTIVE,
        lastOperationalUpdate: Utils.nowIso(),
        updatedAt: Utils.nowIso(),
        updatedBy: user.email
      });
    }

    AuditService.log({
      actorUserId: user.userId,
      actorEmail: user.email,
      action: 'RESPOND_APPROVAL',
      entityType: 'APPROVAL',
      entityId: approvalId,
      beforeSnapshot: target,
      afterSnapshot: updated,
      description: 'Keputusan review ' + target.entityType + ' -> ' + decision + ' (Komentar: ' + (comment || '-') + ')',
      requestId: requestId
    });

    // Notify requester
    NotificationService.queueNotification({
      recipientEmail: target.requestedBy,
      type: decision === CONFIG.APPROVAL_STATUS.APPROVED ? 'APPROVAL_APPROVED' : 'REVISION_REQUESTED',
      entityType: 'APPROVAL',
      entityId: target.approvalId,
      subject: '[NOTARYGO] Hasil Review: ' + decision + ' (' + (matter ? matter.matterNumber : target.entityId) + ')',
      payload: {
        decision: decision,
        comment: comment,
        reviewedBy: user.email
      }
    });

    return updated;
  }
};
