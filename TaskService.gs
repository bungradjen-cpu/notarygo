/**
 * NOTARYGO™ — Notary Office Operational Control System
 * Task Management & My Work Engine
 */

var TaskService = {
  /**
   * Retrieves all tasks with optional filters
   */
  getTasks: function(filter) {
    var user = Security.requireAuth();
    filter = filter || {};
    var all = Repository.Tasks.getAll();

    return all.filter(function(t) {
      if (filter.matterId && t.matterId !== filter.matterId) return false;
      if (filter.assignedTo && t.assignedTo.toLowerCase() !== filter.assignedTo.toLowerCase()) return false;
      if (filter.status && t.status !== filter.status) return false;
      if (filter.priority && t.priority !== filter.priority) return false;
      return true;
    }).sort(function(a, b) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  },

  /**
   * Retrieves tasks for My Work view prioritized by urgency
   */
  getMyWorkData: function(userEmail) {
    var user = Security.requireAuth();
    var email = (userEmail || user.email).toLowerCase();
    var today = Utils.todayIsoDate();

    // 1. Assigned Open Tasks
    var openTasks = Repository.Tasks.find(function(t) {
      return t.assignedTo && t.assignedTo.toLowerCase() === email && t.status !== CONFIG.TASK_STATUS.DONE && t.status !== CONFIG.TASK_STATUS.CANCELLED;
    });

    // Sort by priority order: Overdue > Critical > Today > Others
    openTasks.sort(function(a, b) {
      var aOverdue = a.deadline && a.deadline < today ? 1 : 0;
      var bOverdue = b.deadline && b.deadline < today ? 1 : 0;
      if (aOverdue !== bOverdue) return bOverdue - aOverdue;

      var prioWeight = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      var aPrio = prioWeight[a.priority] || 0;
      var bPrio = prioWeight[b.priority] || 0;
      if (aPrio !== bPrio) return bPrio - aPrio;

      if (a.deadline && b.deadline) {
        return a.deadline.localeCompare(b.deadline);
      }
      return 0;
    });

    // 2. Assigned Active Matters
    var activeMatters = Repository.Matters.find(function(m) {
      return m.assignedPIC && m.assignedPIC.toLowerCase() === email && (m.matterStatus === CONFIG.MATTER_STATUS.ACTIVE || m.matterStatus === CONFIG.MATTER_STATUS.PENDING || m.matterStatus === CONFIG.MATTER_STATUS.WAITING_APPROVAL);
    });

    // 3. Due Follow-Ups
    var dueFollowUps = Repository.FollowUps.find(function(f) {
      return f.PIC && f.PIC.toLowerCase() === email && f.status === CONFIG.FOLLOW_UP_STATUS.SCHEDULED;
    });

    // 4. Assigned Signings
    var upcomingSignings = Repository.Signing.find(function(s) {
      return s.PIC && s.PIC.toLowerCase() === email && (s.status === CONFIG.SIGNING_STATUS.SCHEDULED || s.status === CONFIG.SIGNING_STATUS.READY);
    });

    return {
      tasks: openTasks,
      matters: activeMatters,
      followUps: dueFollowUps,
      signings: upcomingSignings,
      summary: {
        totalTasks: openTasks.length,
        overdueTasks: openTasks.filter(function(t) { return t.deadline && t.deadline < today; }).length,
        activeMatters: activeMatters.length,
        dueFollowUps: dueFollowUps.length,
        upcomingSignings: upcomingSignings.length
      }
    };
  },

  /**
   * Creates a new task
   */
  createTask: function(data, requestId) {
    var user = Security.requireAuth();
    Validation.validateTaskInput(data);

    var matter = Repository.Matters.getById(data.matterId);
    if (!matter) throw new Error('Perkara tidak ditemukan.');

    var taskNumber = Sequence.nextTaskNumber();

    var newTask = {
      taskId: Utils.generateId(CONFIG.PREFIX.TASK),
      matterId: data.matterId,
      taskNumber: taskNumber,
      title: data.title.trim(),
      description: data.description || '',
      assignedTo: data.assignedTo.trim(),
      assignedBy: user.email,
      priority: data.priority || CONFIG.TASK_PRIORITY.MEDIUM,
      startDate: data.startDate || Utils.todayIsoDate(),
      deadline: data.deadline || '',
      status: CONFIG.TASK_STATUS.TODO,
      progress: 0,
      notes: data.notes || '',
      createdAt: Utils.nowIso(),
      updatedAt: Utils.nowIso(),
      completedAt: '',
      completedBy: ''
    };

    var created = Repository.Tasks.insert(newTask);

    // Update matter operational timestamp
    Repository.Matters.update(data.matterId, {
      lastOperationalUpdate: Utils.nowIso(),
      updatedAt: Utils.nowIso(),
      updatedBy: user.email
    });

    AuditService.log({
      actorUserId: user.userId,
      actorEmail: user.email,
      action: 'CREATE_TASK',
      entityType: 'TASK',
      entityId: created.taskId,
      afterSnapshot: created,
      description: 'Membuat tugas ' + created.taskNumber + ' untuk perkara ' + matter.matterNumber + ': ' + created.title + ' (PIC: ' + created.assignedTo + ')',
      requestId: requestId
    });

    // Notify assigned staff
    if (created.assignedTo && created.assignedTo.toLowerCase() !== user.email.toLowerCase()) {
      NotificationService.queueNotification({
        recipientEmail: created.assignedTo,
        type: 'TASK_ASSIGNED',
        entityType: 'TASK',
        entityId: created.taskId,
        subject: '[NOTARYGO] Tugas Baru Ditugaskan: ' + created.title,
        payload: {
          taskNumber: created.taskNumber,
          title: created.title,
          matterNumber: matter.matterNumber,
          priority: created.priority,
          deadline: created.deadline
        }
      });
    }

    return created;
  },

  /**
   * Updates an existing task (Status, progress, notes)
   */
  updateTask: function(taskId, data, requestId) {
    var user = Security.requireAuth();
    var target = Repository.Tasks.getById(taskId);
    if (!target) throw new Error('Tugas tidak ditemukan.');

    var updates = {
      updatedAt: Utils.nowIso()
    };

    if (data.title !== undefined) updates.title = data.title.trim();
    if (data.description !== undefined) updates.description = data.description;
    if (data.assignedTo !== undefined) updates.assignedTo = data.assignedTo.trim();
    if (data.priority !== undefined) updates.priority = data.priority;
    if (data.deadline !== undefined) updates.deadline = data.deadline;
    if (data.notes !== undefined) updates.notes = data.notes;
    if (data.progress !== undefined) updates.progress = Math.min(100, Math.max(0, parseInt(data.progress, 10) || 0));

    if (data.status !== undefined && data.status !== target.status) {
      updates.status = data.status;
      if (data.status === CONFIG.TASK_STATUS.DONE) {
        updates.progress = 100;
        updates.completedAt = Utils.nowIso();
        updates.completedBy = user.email;
      }
    }

    var updated = Repository.Tasks.update(taskId, updates);

    // Touch matter timestamp
    Repository.Matters.update(target.matterId, {
      lastOperationalUpdate: Utils.nowIso(),
      updatedAt: Utils.nowIso(),
      updatedBy: user.email
    });

    AuditService.log({
      actorUserId: user.userId,
      actorEmail: user.email,
      action: 'UPDATE_TASK',
      entityType: 'TASK',
      entityId: taskId,
      beforeSnapshot: target,
      afterSnapshot: updated,
      description: 'Memperbarui tugas ' + target.taskNumber + ' -> Status: ' + updated.status + ' (' + updated.progress + '%)',
      requestId: requestId
    });

    return updated;
  },

  /**
   * Marks a task as DONE quickly
   */
  completeTask: function(taskId, note, requestId) {
    return this.updateTask(taskId, {
      status: CONFIG.TASK_STATUS.DONE,
      progress: 100,
      notes: note
    }, requestId);
  },

  /**
   * Deletes a task
   */
  deleteTask: function(taskId, requestId) {
    var user = Security.requireAuth();
    var target = Repository.Tasks.getById(taskId);
    if (!target) throw new Error('Tugas tidak ditemukan.');

    var success = Repository.Tasks.delete(taskId);

    AuditService.log({
      actorUserId: user.userId,
      actorEmail: user.email,
      action: 'DELETE_TASK',
      entityType: 'TASK',
      entityId: taskId,
      beforeSnapshot: target,
      description: 'Menghapus tugas: ' + target.taskNumber + ' (' + target.title + ')',
      requestId: requestId
    });

    return { success: success, message: 'Tugas ' + target.taskNumber + ' berhasil dihapus.' };
  }
};
