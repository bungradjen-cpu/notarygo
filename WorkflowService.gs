/**
 * NOTARYGO™ — Notary Office Operational Control System
 * Workflow Engine, Templates & State Transition Rules
 */

var WorkflowService = {
  /**
   * Retrieves all workflow templates
   */
  getAllTemplates: function() {
    Security.requireAuth();
    return Repository.WorkflowTemplates.getAll();
  },

  /**
   * Retrieves workflow steps for a template ordered by stepOrder
   */
  getWorkflowSteps: function(workflowId) {
    var steps = Repository.WorkflowSteps.find({ workflowId: workflowId });
    return steps.sort(function(a, b) {
      return parseInt(a.stepOrder, 10) - parseInt(b.stepOrder, 10);
    });
  },

  /**
   * Validates whether a transition from one step to another is allowed
   */
  isTransitionValid: function(workflowId, fromStepCode, toStepCode, isOwnerOverride) {
    if (isOwnerOverride) return true;
    if (fromStepCode === toStepCode) return true;

    var steps = this.getWorkflowSteps(workflowId);
    if (steps.length === 0) return true; // Generic fallback

    var fromIndex = -1;
    var toIndex = -1;

    for (var i = 0; i < steps.length; i++) {
      if (steps[i].stepCode === fromStepCode) fromIndex = i;
      if (steps[i].stepCode === toStepCode) toIndex = i;
    }

    if (fromIndex === -1 || toIndex === -1) {
      return false;
    }

    // Normal forward progression (adjacent step) or backward revision step
    if (toIndex === fromIndex + 1 || toIndex < fromIndex) {
      return true;
    }

    // Specific branch (e.g. waiting document from document checking)
    var fromStep = steps[fromIndex];
    if (fromStep.nextStepCode && fromStep.nextStepCode.split(',').map(function(s){return s.trim();}).indexOf(toStepCode) !== -1) {
      return true;
    }

    return false;
  },

  /**
   * Executes a workflow transition for a Matter
   * @param {string} matterId
   * @param {string} targetStepCode
   * @param {string} [note]
   * @param {boolean} [isOverride]
   * @param {string} [overrideReason]
   * @param {string} [requestId]
   * @return {Object} Updated matter
   */
  transitionWorkflow: function(matterId, targetStepCode, note, isOverride, overrideReason, requestId) {
    var user = Security.requireAuth();
    var matter = Repository.Matters.getById(matterId);
    if (!matter) throw new Error('Perkara tidak ditemukan.');

    var fromStep = matter.currentWorkflowStep;
    var serviceType = Repository.ServiceTypes.getById(matter.serviceTypeId);
    var workflowId = serviceType ? serviceType.defaultWorkflowId : 'WF_DEFAULT';

    var allowedOverride = false;
    if (isOverride) {
      Security.requireRole(CONFIG.ROLES.OWNER);
      allowedOverride = true;
      if (!overrideReason) {
        throw new Error('Alasan wajib diisi untuk Owner override transisi workflow.');
      }
    }

    if (!this.isTransitionValid(workflowId, fromStep, targetStepCode, allowedOverride)) {
      throw new Error('TRANSITION_INVALID: Perpindahan tahapan dari ' + fromStep + ' ke ' + targetStepCode + ' tidak diizinkan dalam alur kerja standar. Hubungi Owner untuk melakukan override jika diperlukan.');
    }

    // Calculate duration on previous step
    var lastHistory = Repository.WorkflowHistory.find({ matterId: matterId }).sort(function(a, b) {
      return new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime();
    });
    var durationHours = 0;
    if (lastHistory.length > 0) {
      var lastDate = new Date(lastHistory[0].changedAt);
      var now = new Date();
      durationHours = Math.max(0, Math.round((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60)));
    }

    var matterUpdates = {
      currentWorkflowStep: targetStepCode,
      lastOperationalUpdate: Utils.nowIso(),
      updatedAt: Utils.nowIso(),
      updatedBy: user.email
    };

    // If transitioned to COMPLETED
    if (targetStepCode === 'COMPLETED') {
      matterUpdates.matterStatus = CONFIG.MATTER_STATUS.COMPLETED;
      matterUpdates.completedAt = Utils.nowIso();
    }

    var updatedMatter = Repository.Matters.update(matterId, matterUpdates);

    // Record immutable workflow history
    Repository.WorkflowHistory.insert({
      workflowHistoryId: Utils.generateId(CONFIG.PREFIX.HISTORY),
      matterId: matterId,
      fromStep: fromStep,
      toStep: targetStepCode,
      changedBy: user.email,
      changedAt: Utils.nowIso(),
      note: note || (isOverride ? 'Owner Override: ' + overrideReason : 'Perpindahan alur kerja'),
      durationPreviousStepHours: durationHours,
      isOverride: allowedOverride,
      requestId: requestId
    });

    AuditService.log({
      actorUserId: user.userId,
      actorEmail: user.email,
      action: 'WORKFLOW_TRANSITION',
      entityType: 'MATTER',
      entityId: matterId,
      beforeSnapshot: { step: fromStep },
      afterSnapshot: { step: targetStepCode },
      description: 'Transisi workflow perkara ' + matter.matterNumber + ' dari ' + fromStep + ' -> ' + targetStepCode + (allowedOverride ? ' (OVERRIDE: ' + overrideReason + ')' : ''),
      requestId: requestId
    });

    return updatedMatter;
  }
};
