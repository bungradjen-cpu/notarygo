/**
 * NOTARYGO™ — Notary Office Operational Control System
 * Central Matter / Register Perkara Management Service
 */

var MatterService = {
  /**
   * Retrieves all matters based on user permission and optional filters
   * @param {Object} [filter]
   * @return {Array<Object>}
   */
  getMatters: function(filter) {
    var user = Security.requireAuth();
    filter = filter || {};
    var all = Repository.Matters.getAll();

    return all.filter(function(m) {
      // Permission scoping
      if (!Security.canAccessMatter(user, m)) {
        return false;
      }

      // Status filters
      if (filter.status) {
        if (filter.status === 'ACTIVE_ONLY') {
          if (m.matterStatus !== CONFIG.MATTER_STATUS.ACTIVE && m.matterStatus !== CONFIG.MATTER_STATUS.PENDING && m.matterStatus !== CONFIG.MATTER_STATUS.WAITING_APPROVAL) {
            return false;
          }
        } else if (m.matterStatus !== filter.status) {
          return false;
        }
      } else if (!filter.includeArchived && !filter.includeCancelled) {
        // By default, exclude CANCELLED and ARCHIVED from regular list unless requested
        if (m.matterStatus === CONFIG.MATTER_STATUS.CANCELLED || m.matterStatus === CONFIG.MATTER_STATUS.ARCHIVED) {
          return false;
        }
      }

      if (filter.serviceTypeId && m.serviceTypeId !== filter.serviceTypeId) return false;
      if (filter.assignedPIC && m.assignedPIC !== filter.assignedPIC) return false;
      if (filter.clientId && m.clientId !== filter.clientId) return false;
      if (filter.organizationId && m.organizationId !== filter.organizationId) return false;
      if (filter.priority && m.priority !== filter.priority) return false;

      // Global search
      if (filter.searchQuery) {
        var q = filter.searchQuery.toLowerCase().trim();
        var num = (m.matterNumber || '').toLowerCase();
        var client = (m.clientNameSnapshot || '').toLowerCase();
        var title = (m.title || '').toLowerCase();
        var pic = (m.assignedPIC || '').toLowerCase();
        var service = (m.serviceTypeNameSnapshot || '').toLowerCase();
        if (num.indexOf(q) === -1 && client.indexOf(q) === -1 && title.indexOf(q) === -1 && pic.indexOf(q) === -1 && service.indexOf(q) === -1) {
          return false;
        }
      }

      return true;
    }).sort(function(a, b) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  },

  /**
   * Retrieves single matter by ID with related operational data
   * @param {string} matterId
   * @return {Object}
   */
  getMatterDetail: function(matterId) {
    var user = Security.requireAuth();
    var matter = Repository.Matters.getById(matterId);
    if (!matter) throw new Error('Perkara tidak ditemukan.');

    if (!Security.canAccessMatter(user, matter)) {
      throw new Error('FORBIDDEN: Anda tidak memiliki akses ke perkara ini.');
    }

    var client = Repository.Clients.getById(matter.clientId);
    var organization = matter.organizationId ? Repository.Organizations.getById(matter.organizationId) : null;
    var serviceType = Repository.ServiceTypes.getById(matter.serviceTypeId);
    var workflowHistory = Repository.WorkflowHistory.find({ matterId: matterId }).sort(function(a, b) {
      return new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime();
    });
    var tasks = Repository.Tasks.find({ matterId: matterId });
    var pendingRecord = matter.pendingStatus === 'PENDING' ? Repository.Pending.findOne(function(p) {
      return p.matterId === matterId && p.status === 'ACTIVE';
    }) : null;
    var followUps = Repository.FollowUps.find({ matterId: matterId });
    var checklistItems = Repository.ChecklistItems.find({ matterId: matterId });
    var documents = Repository.Documents.find({ matterId: matterId });
    var approvals = Repository.Approvals.find({ matterId: matterId });
    var signings = Repository.Signing.find({ matterId: matterId });
    var communications = Repository.Communications.find({ matterId: matterId });
    var invoices = Repository.Invoices.find({ matterId: matterId });

    // Calculate checklist completion percentage
    var checklistStats = ChecklistService.calculateCompleteness(matterId);

    // Calculate deadline risk
    var deadlineRisk = AlertService.getDeadlineRisk(matter.deadline);

    return {
      matter: matter,
      client: client,
      organization: organization,
      serviceType: serviceType,
      workflowHistory: workflowHistory,
      tasks: tasks,
      pendingRecord: pendingRecord,
      followUps: followUps,
      checklistItems: checklistItems,
      checklistStats: checklistStats,
      documents: documents,
      approvals: approvals,
      signings: signings,
      communications: communications,
      invoices: invoices,
      deadlineRisk: deadlineRisk
    };
  },

  /**
   * Creates a new Matter
   * @param {Object} data
   * @param {string} [requestId]
   * @return {Object}
   */
  createMatter: function(data, requestId) {
    var user = Security.requirePermission(Permissions.LIST.MATTER_CREATE);
    Validation.validateMatterInput(data);

    var client = Repository.Clients.getById(data.clientId);
    if (!client) throw new Error('Client tidak ditemukan.');

    var serviceType = Repository.ServiceTypes.getById(data.serviceTypeId);
    var serviceTypeName = serviceType ? serviceType.name : (data.serviceTypeNameSnapshot || 'Layanan Umum');

    var officeProfile = OfficeService.getProfile();
    var matterPrefix = (officeProfile && officeProfile.matterPrefix) ? officeProfile.matterPrefix : 'NG';
    var matterNumber = Sequence.nextMatterNumber(matterPrefix);

    var initialWorkflowStep = 'INCOMING';
    if (serviceType && serviceType.defaultWorkflowId) {
      var steps = WorkflowService.getWorkflowSteps(serviceType.defaultWorkflowId);
      if (steps.length > 0) {
        initialWorkflowStep = steps[0].stepCode;
      }
    }

    var matterId = Utils.generateId(CONFIG.PREFIX.MATTER);

    // Auto-create Drive folder if Drive service available
    var driveFolderId = '';
    try {
      driveFolderId = DriveService.createMatterFolderStructure(matterNumber, client.name);
    } catch (e) {}

    var newMatter = {
      matterId: matterId,
      matterNumber: matterNumber,
      clientId: data.clientId,
      clientNameSnapshot: client.name,
      serviceTypeId: data.serviceTypeId,
      serviceTypeNameSnapshot: serviceTypeName,
      organizationId: data.organizationId || '',
      title: data.title.trim(),
      description: data.description || '',
      priority: data.priority || CONFIG.TASK_PRIORITY.MEDIUM,
      assignedPIC: data.assignedPIC || user.email,
      supervisor: data.supervisor || user.email,
      currentWorkflowStep: initialWorkflowStep,
      matterStatus: CONFIG.MATTER_STATUS.ACTIVE,
      deadline: data.deadline || '',
      lastOperationalUpdate: Utils.nowIso(),
      pendingStatus: 'NONE',
      pendingReason: '',
      nextAction: data.nextAction || 'Pemeriksaan kelengkapan berkas',
      driveFolderId: driveFolderId,
      financialStatus: 'UNBILLED',
      isArchived: false,
      createdBy: user.email,
      createdAt: Utils.nowIso(),
      updatedBy: user.email,
      updatedAt: Utils.nowIso(),
      completedAt: '',
      cancelledAt: '',
      cancelledBy: '',
      cancellationReason: '',
      archivedAt: '',
      archivedBy: '',
      archiveReason: ''
    };

    var created = Repository.Matters.insert(newMatter);

    // Record initial workflow history
    Repository.WorkflowHistory.insert({
      workflowHistoryId: Utils.generateId(CONFIG.PREFIX.HISTORY),
      matterId: matterId,
      fromStep: 'START',
      toStep: initialWorkflowStep,
      changedBy: user.email,
      changedAt: Utils.nowIso(),
      note: 'Perkara baru dibuat.',
      durationPreviousStepHours: 0,
      isOverride: false,
      requestId: requestId
    });

    // Auto initialize document checklist items from template if available
    try {
      ChecklistService.initializeChecklistForMatter(matterId, data.serviceTypeId);
    } catch (e) {}

    AuditService.log({
      actorUserId: user.userId,
      actorEmail: user.email,
      action: 'CREATE_MATTER',
      entityType: 'MATTER',
      entityId: created.matterId,
      afterSnapshot: created,
      description: 'Membuat perkara baru: ' + created.matterNumber + ' (' + created.title + ')',
      requestId: requestId
    });

    // Queue notification if assigned to another staff
    if (created.assignedPIC && created.assignedPIC.toLowerCase() !== user.email.toLowerCase()) {
      NotificationService.queueNotification({
        recipientEmail: created.assignedPIC,
        type: 'MATTER_ASSIGNED',
        entityType: 'MATTER',
        entityId: created.matterId,
        subject: '[NOTARYGO] Perkara Baru Ditugaskan: ' + created.matterNumber,
        payload: {
          matterNumber: created.matterNumber,
          title: created.title,
          client: created.clientNameSnapshot,
          deadline: created.deadline
        }
      });
    }

    return created;
  },

  /**
   * Updates Matter basic information, PIC, deadline, or nextAction
   */
  updateMatter: function(matterId, data, requestId) {
    var user = Security.requirePermission(Permissions.LIST.MATTER_EDIT);
    var target = Repository.Matters.getById(matterId);
    if (!target) throw new Error('Perkara tidak ditemukan.');

    var updates = {};
    var auditDescriptions = [];

    if (data.title !== undefined && data.title.trim() !== '') {
      updates.title = data.title.trim();
    }
    if (data.description !== undefined) {
      updates.description = data.description;
    }
    if (data.priority !== undefined) {
      updates.priority = data.priority;
    }
    if (data.organizationId !== undefined) {
      updates.organizationId = data.organizationId;
    }
    if (data.nextAction !== undefined) {
      updates.nextAction = data.nextAction;
    }

    // PIC Change tracking
    if (data.assignedPIC !== undefined && data.assignedPIC !== target.assignedPIC) {
      updates.assignedPIC = data.assignedPIC;
      auditDescriptions.push('PIC diubah dari ' + target.assignedPIC + ' ke ' + data.assignedPIC);
    }
    if (data.supervisor !== undefined && data.supervisor !== target.supervisor) {
      updates.supervisor = data.supervisor;
    }

    // Deadline Change tracking
    if (data.deadline !== undefined && data.deadline !== target.deadline) {
      if (data.deadline && !Validation.isValidDate(data.deadline)) {
        throw new Error('Format tanggal deadline tidak valid.');
      }
      updates.deadline = data.deadline;
      auditDescriptions.push('Deadline diubah dari ' + (target.deadline || 'Kosong') + ' ke ' + (data.deadline || 'Kosong') + (data.deadlineReason ? ' (Alasan: ' + data.deadlineReason + ')' : ''));
    }

    updates.lastOperationalUpdate = Utils.nowIso();
    updates.updatedAt = Utils.nowIso();
    updates.updatedBy = user.email;

    var updated = Repository.Matters.update(matterId, updates);

    AuditService.log({
      actorUserId: user.userId,
      actorEmail: user.email,
      action: 'UPDATE_MATTER',
      entityType: 'MATTER',
      entityId: matterId,
      beforeSnapshot: target,
      afterSnapshot: updated,
      description: 'Memperbarui perkara ' + target.matterNumber + (auditDescriptions.length > 0 ? ': ' + auditDescriptions.join('; ') : ''),
      requestId: requestId
    });

    return updated;
  },

  /**
   * Cancels a Matter (Soft Cancel without hard deletion)
   */
  cancelMatter: function(matterId, reason, note, requestId) {
    var user = Security.requirePermission(Permissions.LIST.MATTER_CANCEL);
    var target = Repository.Matters.getById(matterId);
    if (!target) throw new Error('Perkara tidak ditemukan.');

    if (CONFIG.CANCEL_REASONS.indexOf(reason) === -1) {
      throw new Error('Alasan pembatalan tidak valid. Pilihan: ' + CONFIG.CANCEL_REASONS.join(', '));
    }

    var updates = {
      matterStatus: CONFIG.MATTER_STATUS.CANCELLED,
      cancelledAt: Utils.nowIso(),
      cancelledBy: user.email,
      cancellationReason: reason + (note ? ': ' + note : ''),
      lastOperationalUpdate: Utils.nowIso(),
      updatedAt: Utils.nowIso(),
      updatedBy: user.email
    };

    var updated = Repository.Matters.update(matterId, updates);

    AuditService.log({
      actorUserId: user.userId,
      actorEmail: user.email,
      action: 'CANCEL_MATTER',
      entityType: 'MATTER',
      entityId: matterId,
      beforeSnapshot: target,
      afterSnapshot: updated,
      description: 'Membatalkan perkara ' + target.matterNumber + '. Alasan: ' + updates.cancellationReason,
      requestId: requestId
    });

    return updated;
  },

  /**
   * Archives a Matter
   */
  archiveMatter: function(matterId, reason, requestId) {
    var user = Security.requirePermission(Permissions.LIST.MATTER_ARCHIVE);
    var target = Repository.Matters.getById(matterId);
    if (!target) throw new Error('Perkara tidak ditemukan.');

    var updates = {
      isArchived: true,
      matterStatus: CONFIG.MATTER_STATUS.ARCHIVED,
      archivedAt: Utils.nowIso(),
      archivedBy: user.email,
      archiveReason: reason || 'Diarsipkan oleh ' + user.name,
      updatedAt: Utils.nowIso(),
      updatedBy: user.email
    };

    var updated = Repository.Matters.update(matterId, updates);

    AuditService.log({
      actorUserId: user.userId,
      actorEmail: user.email,
      action: 'ARCHIVE_MATTER',
      entityType: 'MATTER',
      entityId: matterId,
      beforeSnapshot: target,
      afterSnapshot: updated,
      description: 'Mengarsipkan perkara ' + target.matterNumber + '. Alasan: ' + updates.archiveReason,
      requestId: requestId
    });

    return updated;
  },

  /**
   * Restores a Cancelled or Archived Matter back to ACTIVE (Owner Only)
   */
  restoreMatter: function(matterId, reason, requestId) {
    var user = Security.requirePermission(Permissions.LIST.MATTER_RESTORE);
    var target = Repository.Matters.getById(matterId);
    if (!target) throw new Error('Perkara tidak ditemukan.');

    if (target.matterStatus !== CONFIG.MATTER_STATUS.CANCELLED && target.matterStatus !== CONFIG.MATTER_STATUS.ARCHIVED) {
      throw new Error('Hanya perkara yang dibatalkan atau diarsipkan yang dapat dipulihkan.');
    }

    var updates = {
      matterStatus: CONFIG.MATTER_STATUS.ACTIVE,
      isArchived: false,
      lastOperationalUpdate: Utils.nowIso(),
      updatedAt: Utils.nowIso(),
      updatedBy: user.email
    };

    var updated = Repository.Matters.update(matterId, updates);

    AuditService.log({
      actorUserId: user.userId,
      actorEmail: user.email,
      action: 'RESTORE_MATTER',
      entityType: 'MATTER',
      entityId: matterId,
      beforeSnapshot: target,
      afterSnapshot: updated,
      description: 'Memulihkan perkara ' + target.matterNumber + ' ke status AKTIF. Catatan: ' + (reason || '-'),
      requestId: requestId
    });

    return updated;
  },

  /**
   * Permanently deletes a matter and its associated tasks/checklists (Admin/Owner Only)
   */
  deleteMatter: function(matterId, requestId) {
    var user = Security.requirePermission(Permissions.LIST.MATTER_CANCEL);
    var target = Repository.Matters.getById(matterId);
    if (!target) throw new Error('Perkara tidak ditemukan.');

    // Delete associated sub-items
    var tasks = Repository.Tasks.find({ matterId: matterId });
    for (var t = 0; t < tasks.length; t++) {
      Repository.Tasks.delete(tasks[t].taskId);
    }

    var checklist = Repository.ChecklistItems.find({ matterId: matterId });
    for (var c = 0; c < checklist.length; c++) {
      Repository.ChecklistItems.delete(checklist[c].checklistItemId);
    }

    var signings = Repository.Signings.find({ matterId: matterId });
    for (var s = 0; s < signings.length; s++) {
      Repository.Signings.delete(signings[s].signingId);
    }

    var success = Repository.Matters.delete(matterId);

    AuditService.log({
      actorUserId: user.userId,
      actorEmail: user.email,
      action: 'DELETE_MATTER',
      entityType: 'MATTER',
      entityId: matterId,
      beforeSnapshot: target,
      description: 'Menghapus permanen perkara: ' + target.matterNumber + ' (' + target.title + ')',
      requestId: requestId
    });

    return { success: success, message: 'Perkara ' + target.matterNumber + ' berhasil dihapus permanen.' };
  }
};
