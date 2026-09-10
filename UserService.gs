/**
 * NOTARYGO™ — Notary Office Operational Control System
 * User Management, Credential Security & Staff Handover Service
 */

var UserService = {
  /**
   * Retrieves all users with sanitized fields (Owner / Admin)
   */
  getAllUsers: function() {
    Security.requireRole([CONFIG.ROLES.OWNER, CONFIG.ROLES.ADMIN]);
    return Repository.Users.getAll().map(function(u) {
      return Auth.sanitizeUser(u);
    });
  },

  /**
   * Retrieves active staff for assignment dropdowns
   */
  getActiveStaffList: function() {
    Security.requireAuth();
    return Repository.Users.find(function(u) {
      return u.status === CONFIG.USER_STATUS.ACTIVE;
    }).map(function(u) {
      return {
        userId: u.userId,
        name: u.name,
        email: u.email,
        role: u.role,
        phone: u.phone
      };
    });
  },

  /**
   * Creates a new user with password (Owner / Super Admin)
   */
  createUser: function(data, requestId) {
    var actor = Security.requireRole(CONFIG.ROLES.OWNER);
    Validation.requireFields(data, ['email', 'name', 'role']);

    var email = data.email.toLowerCase().trim();
    if (!Validation.isValidEmail(email)) {
      throw new Error('Format email tidak valid.');
    }
    if (!Validation.isValidRole(data.role)) {
      throw new Error('Role tidak valid: ' + data.role);
    }

    var existing = Repository.Users.findOne(function(u) {
      return u.email && u.email.toLowerCase() === email;
    });
    if (existing) {
      throw new Error('Pengguna dengan email ' + email + ' sudah terdaftar.');
    }

    // Set initial password (custom or default)
    var initialPassword = data.password ? String(data.password).trim() : 'NotaryGo123!';
    if (initialPassword.length < 6) {
      throw new Error('Password minimal harus 6 karakter.');
    }

    var salt = Utils.generateSalt();
    var hash = Utils.hashPassword(initialPassword, salt);

    var newUser = {
      userId: Utils.generateId(CONFIG.PREFIX.USER),
      email: email,
      name: data.name.trim(),
      role: data.role,
      phone: data.phone || '',
      status: CONFIG.USER_STATUS.ACTIVE,
      passwordHash: hash,
      passwordSalt: salt,
      lastLoginAt: '',
      notificationPreferences: Utils.safeJsonStringify(data.notificationPreferences || {
        taskAssigned: true,
        deadlineH3: true,
        deadlineH1: true,
        overdue: true,
        signing: true,
        dailySummary: true
      }),
      createdAt: Utils.nowIso(),
      createdBy: actor.email,
      updatedAt: Utils.nowIso(),
      updatedBy: actor.email
    };

    var created = Repository.Users.insert(newUser);

    AuditService.log({
      actorUserId: actor.userId,
      actorEmail: actor.email,
      action: 'CREATE_USER',
      entityType: 'USER',
      entityId: created.userId,
      afterSnapshot: Auth.sanitizeUser(created),
      description: 'Super Admin menambahkan pengguna baru: ' + created.name + ' (' + created.email + ') sebagai ' + created.role,
      requestId: requestId
    });

    return Auth.sanitizeUser(created);
  },

  /**
   * Super Admin resets password for a user
   */
  resetUserPassword: function(userId, newPassword, requestId) {
    var actor = Security.requireRole([CONFIG.ROLES.OWNER, CONFIG.ROLES.ADMIN]);
    if (!userId || !newPassword) {
      throw new Error('User ID dan password baru wajib diisi.');
    }
    if (String(newPassword).trim().length < 6) {
      throw new Error('Password baru minimal harus 6 karakter.');
    }

    var target = Repository.Users.getById(userId);
    if (!target) throw new Error('Pengguna tidak ditemukan.');

    // Only OWNER can reset another OWNER's password
    if (target.role === CONFIG.ROLES.OWNER && actor.role !== CONFIG.ROLES.OWNER) {
      throw new Error('Hanya Super Admin / Notaris yang dapat mereset password sesama Owner.');
    }

    var salt = Utils.generateSalt();
    var hash = Utils.hashPassword(newPassword.trim(), salt);

    Repository.Users.update(userId, {
      passwordHash: hash,
      passwordSalt: salt,
      updatedAt: Utils.nowIso(),
      updatedBy: actor.email
    });

    AuditService.log({
      actorUserId: actor.userId,
      actorEmail: actor.email,
      action: 'RESET_USER_PASSWORD',
      entityType: 'USER',
      entityId: userId,
      description: 'Super Admin (' + actor.email + ') mereset password untuk pengguna: ' + target.name + ' (' + target.email + ')',
      requestId: requestId
    });

    return {
      success: true,
      message: 'Password pengguna ' + target.name + ' berhasil direset.'
    };
  },

  /**
   * Logged-in user changes own password
   */
  changePassword: function(userId, oldPassword, newPassword, requestId) {
    var actor = Security.requireAuth();
    if (actor.userId !== userId && actor.role !== CONFIG.ROLES.OWNER) {
      throw new Error('Anda hanya dapat mengubah password akun Anda sendiri.');
    }

    if (!newPassword || String(newPassword).trim().length < 6) {
      throw new Error('Password baru minimal harus 6 karakter.');
    }

    var target = Repository.Users.getById(userId);
    if (!target) throw new Error('Pengguna tidak ditemukan.');

    // Verify old password if set
    if (target.passwordHash && target.passwordSalt) {
      var computed = Utils.hashPassword(oldPassword, target.passwordSalt);
      if (computed !== target.passwordHash) {
        throw new Error('Password lama yang Anda masukkan salah.');
      }
    }

    var salt = Utils.generateSalt();
    var hash = Utils.hashPassword(newPassword.trim(), salt);

    Repository.Users.update(userId, {
      passwordHash: hash,
      passwordSalt: salt,
      updatedAt: Utils.nowIso(),
      updatedBy: actor.email
    });

    AuditService.log({
      actorUserId: actor.userId,
      actorEmail: actor.email,
      action: 'CHANGE_PASSWORD',
      entityType: 'USER',
      entityId: userId,
      description: 'Pengguna (' + target.email + ') mengubah password akun secara mandiri.',
      requestId: requestId
    });

    return {
      success: true,
      message: 'Password Anda berhasil diperbarui.'
    };
  },

  /**
   * Updates an existing user role or details
   */
  updateUser: function(userId, data, requestId) {
    var actor = Security.requireRole(CONFIG.ROLES.OWNER);
    var target = Repository.Users.getById(userId);
    if (!target) throw new Error('Pengguna tidak ditemukan.');

    if (data.role && !Validation.isValidRole(data.role)) {
      throw new Error('Role tidak valid: ' + data.role);
    }

    // Protect sole Owner demotion
    if (target.role === CONFIG.ROLES.OWNER && data.role && data.role !== CONFIG.ROLES.OWNER) {
      var allOwners = Repository.Users.find(function(u) {
        return u.role === CONFIG.ROLES.OWNER && u.status === CONFIG.USER_STATUS.ACTIVE;
      });
      if (allOwners.length <= 1) {
        throw new Error('Tidak dapat mengubah peran Owner terakhir di kantor.');
      }
    }

    var updates = {
      name: data.name !== undefined ? data.name.trim() : target.name,
      role: data.role !== undefined ? data.role : target.role,
      phone: data.phone !== undefined ? data.phone : target.phone,
      status: data.status !== undefined ? data.status : target.status,
      updatedAt: Utils.nowIso(),
      updatedBy: actor.email
    };

    var updated = Repository.Users.update(userId, updates);

    AuditService.log({
      actorUserId: actor.userId,
      actorEmail: actor.email,
      action: 'UPDATE_USER',
      entityType: 'USER',
      entityId: userId,
      beforeSnapshot: Auth.sanitizeUser(target),
      afterSnapshot: Auth.sanitizeUser(updated),
      description: 'Memperbarui profil/role staf: ' + updated.name,
      requestId: requestId
    });

    return Auth.sanitizeUser(updated);
  },

  /**
   * Deactivates or suspends a user
   */
  deactivateUser: function(userId, requestId) {
    var actor = Security.requireRole(CONFIG.ROLES.OWNER);
    var target = Repository.Users.getById(userId);
    if (!target) throw new Error('Pengguna tidak ditemukan.');

    if (target.role === CONFIG.ROLES.OWNER) {
      var activeOwners = Repository.Users.find(function(u) {
        return u.role === CONFIG.ROLES.OWNER && u.status === CONFIG.USER_STATUS.ACTIVE;
      });
      if (activeOwners.length <= 1) {
        throw new Error('Tidak dapat menonaktifkan Owner tunggal.');
      }
    }

    var updated = Repository.Users.update(userId, {
      status: CONFIG.USER_STATUS.INACTIVE,
      updatedAt: Utils.nowIso(),
      updatedBy: actor.email
    });

    AuditService.log({
      actorUserId: actor.userId,
      actorEmail: actor.email,
      action: 'DEACTIVATE_USER',
      entityType: 'USER',
      entityId: userId,
      beforeSnapshot: Auth.sanitizeUser(target),
      afterSnapshot: Auth.sanitizeUser(updated),
      description: 'Menonaktifkan akses login pengguna: ' + target.name + ' (' + target.email + ')',
      requestId: requestId
    });

    return Auth.sanitizeUser(updated);
  },

  /**
   * Reassigns all active responsibilities from old PIC to new PIC (Staff Handover)
   */
  handoverResponsibilities: function(fromEmail, toEmail, requestId) {
    var actor = Security.requireRole([CONFIG.ROLES.OWNER, CONFIG.ROLES.ADMIN]);
    if (!fromEmail || !toEmail) throw new Error('Email staf asal dan tujuan wajib diisi.');
    if (fromEmail.toLowerCase() === toEmail.toLowerCase()) throw new Error('Staf asal dan staf penerima tidak boleh sama.');

    var targetUser = Repository.Users.findOne(function(u) {
      return u.email && u.email.toLowerCase() === toEmail.toLowerCase() && u.status === CONFIG.USER_STATUS.ACTIVE;
    });
    if (!targetUser) throw new Error('Staf tujuan tidak aktif atau tidak ditemukan.');

    var matterCount = 0;
    var taskCount = 0;
    var followUpCount = 0;
    var signingCount = 0;

    // 1. Reassign Matters
    var matters = Repository.Matters.find(function(m) {
      return m.assignedPIC && m.assignedPIC.toLowerCase() === fromEmail.toLowerCase() && m.matterStatus === CONFIG.MATTER_STATUS.ACTIVE;
    });
    matters.forEach(function(m) {
      Repository.Matters.update(m.matterId, {
        assignedPIC: targetUser.email,
        lastOperationalUpdate: Utils.nowIso(),
        updatedAt: Utils.nowIso(),
        updatedBy: actor.email
      });
      matterCount++;
    });

    // 2. Reassign Tasks
    var tasks = Repository.Tasks.find(function(t) {
      return t.assignedTo && t.assignedTo.toLowerCase() === fromEmail.toLowerCase() && (t.status === CONFIG.TASK_STATUS.TODO || t.status === CONFIG.TASK_STATUS.IN_PROGRESS || t.status === CONFIG.TASK_STATUS.WAITING);
    });
    tasks.forEach(function(t) {
      Repository.Tasks.update(t.taskId, {
        assignedTo: targetUser.email,
        updatedAt: Utils.nowIso()
      });
      taskCount++;
    });

    // 3. Reassign Follow-Ups
    var followUps = Repository.FollowUps.find(function(f) {
      return f.PIC && f.PIC.toLowerCase() === fromEmail.toLowerCase() && f.status === CONFIG.FOLLOW_UP_STATUS.SCHEDULED;
    });
    followUps.forEach(function(f) {
      Repository.FollowUps.update(f.followUpId, {
        PIC: targetUser.email,
        updatedAt: Utils.nowIso()
      });
      followUpCount++;
    });

    // 4. Reassign Signing
    var signings = Repository.Signing.find(function(s) {
      return s.PIC && s.PIC.toLowerCase() === fromEmail.toLowerCase() && (s.status === CONFIG.SIGNING_STATUS.SCHEDULED || s.status === CONFIG.SIGNING_STATUS.READY);
    });
    signings.forEach(function(s) {
      Repository.Signing.update(s.signingId, {
        PIC: targetUser.email,
        updatedAt: Utils.nowIso()
      });
      signingCount++;
    });

    AuditService.log({
      actorUserId: actor.userId,
      actorEmail: actor.email,
      action: 'STAFF_HANDOVER',
      entityType: 'USER',
      entityId: targetUser.userId,
      description: 'Handover staf dari ' + fromEmail + ' ke ' + toEmail + ': ' + matterCount + ' perkara, ' + taskCount + ' task, ' + followUpCount + ' follow-up, ' + signingCount + ' signing.',
      requestId: requestId
    });

    return {
      success: true,
      fromEmail: fromEmail,
      toEmail: toEmail,
      transferred: {
        matters: matterCount,
        tasks: taskCount,
        followUps: followUpCount,
        signings: signingCount
      }
    };
  }
};
