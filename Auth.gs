/**
 * NOTARYGO™ — Notary Office Operational Control System
 * Authentication Layer & Credential Login Adapter
 */

var Auth = (function() {
  var _mockSessionUser = undefined;

  /**
   * Sets mock session user for testing
   */
  function setMockUser(userObj) {
    _mockSessionUser = userObj;
  }

  function getMockUser() {
    return _mockSessionUser;
  }

  /**
   * Resolves current user email from active Google Session
   * @return {string}
   */
  function getActiveEmail() {
    if (_mockSessionUser && _mockSessionUser.email) {
      return _mockSessionUser.email.toLowerCase().trim();
    }

    try {
      var email = Session.getActiveUser().getEmail();
      if (email) return email.toLowerCase().trim();
    } catch (e) {}

    try {
      var effectiveEmail = Session.getEffectiveUser().getEmail();
      if (effectiveEmail) return effectiveEmail.toLowerCase().trim();
    } catch (e) {}

    return '';
  }

  /**
   * Authenticates user using Email and Password
   * @param {string} email
   * @param {string} password
   * @param {string} [requestId]
   * @return {Object} Authenticated user profile without secrets
   */
  function login(email, password, requestId) {
    if (!email || !password) {
      throw new Error('Email dan password wajib diisi.');
    }

    var cleanEmail = email.toLowerCase().trim();
    var user = Repository.Users.findOne(function(u) {
      return u.email && u.email.toLowerCase() === cleanEmail;
    });

    if (!user) {
      throw new Error('Email atau password salah.');
    }

    if (user.status !== CONFIG.USER_STATUS.ACTIVE) {
      throw new Error('Akun Anda dinonaktifkan. Silakan hubungi Super Admin / Notaris.');
    }

    // Verify Password Hash
    var isValidPassword = false;
    if (user.passwordHash && user.passwordSalt) {
      var computed = Utils.hashPassword(password, user.passwordSalt);
      isValidPassword = computed === user.passwordHash;
    } else {
      // Fallback for initial account before password change (default: NotaryGo123!)
      if (password === 'NotaryGo123!') {
        isValidPassword = true;
        // Auto-initialize salt & hash
        var salt = Utils.generateSalt();
        var hash = Utils.hashPassword(password, salt);
        Repository.Users.update(user.userId, {
          passwordHash: hash,
          passwordSalt: salt
        });
      }
    }

    if (!isValidPassword) {
      AuditService.log({
        actorUserId: user.userId,
        actorEmail: user.email,
        action: 'FAILED_LOGIN_ATTEMPT',
        entityType: 'AUTH',
        entityId: user.userId,
        description: 'Percobaan login gagal untuk akun: ' + user.email,
        requestId: requestId
      });
      throw new Error('Email atau password salah.');
    }

    // Update last login timestamp
    var now = Utils.nowIso();
    user.lastLoginAt = now;
    Repository.Users.update(user.userId, {
      lastLoginAt: now,
      updatedAt: now
    });

    AuditService.log({
      actorUserId: user.userId,
      actorEmail: user.email,
      action: 'USER_LOGIN',
      entityType: 'AUTH',
      entityId: user.userId,
      description: 'Pengguna berhasil login: ' + user.name + ' (' + user.email + ') role ' + user.role,
      requestId: requestId
    });

    return sanitizeUser(user);
  }

  /**
   * Sanitizes user object to strip passwordHash and passwordSalt
   * @param {Object} user
   * @return {Object}
   */
  function sanitizeUser(user) {
    if (!user) return null;
    return {
      userId: user.userId,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone || '',
      status: user.status,
      lastLoginAt: user.lastLoginAt || '',
      hasPassword: Boolean(user.passwordHash)
    };
  }

  /**
   * Resolves and authenticates the current user against Users sheet
   * @param {string} [explicitEmail] Optional client-provided email
   * @return {Object|null} Authenticated user object or null
   */
  function getCurrentUser(explicitEmail) {
    if (_mockSessionUser !== undefined) {
      if (_mockSessionUser && _mockSessionUser.status === CONFIG.USER_STATUS.ACTIVE) {
        return _mockSessionUser;
      }
      return null;
    }

    var targetEmail = explicitEmail ? explicitEmail.toLowerCase().trim() : getActiveEmail();

    if (targetEmail) {
      var found = Repository.Users.findOne(function(u) {
        return u.email && u.email.toLowerCase() === targetEmail;
      });
      if (found && found.status === CONFIG.USER_STATUS.ACTIVE) {
        return found;
      }
    }

    // Fallback for initial Owner bootstrapping
    var ownerEmail = PropertiesService.getScriptProperties().getProperty(CONFIG.KEYS.OWNER_EMAIL);
    if (ownerEmail) {
      var owner = Repository.Users.findOne(function(u) {
        return u.email && u.email.toLowerCase() === ownerEmail.toLowerCase();
      });
      if (owner && owner.status === CONFIG.USER_STATUS.ACTIVE) {
        return owner;
      }
    }

    return null;
  }

  /**
   * Diagnostic check for identity availability
   * @param {string} [explicitEmail]
   * @return {Object}
   */
  function getIdentityDiagnostic(explicitEmail) {
    var email = explicitEmail || getActiveEmail();
    var user = getCurrentUser(explicitEmail);
    var registered = false;
    var active = false;

    if (email) {
      var rec = Repository.Users.findOne(function(u) {
        return u.email && u.email.toLowerCase() === email.toLowerCase();
      });
      if (rec) {
        registered = true;
        active = rec.status === CONFIG.USER_STATUS.ACTIVE;
      }
    }

    return {
      googleEmail: email || 'TIDAK_TERDETEKSI',
      isRegistered: registered,
      isActive: active,
      user: sanitizeUser(user),
      timestamp: Utils.nowIso()
    };
  }

  return {
    getActiveEmail: getActiveEmail,
    getCurrentUser: getCurrentUser,
    getIdentityDiagnostic: getIdentityDiagnostic,
    login: login,
    sanitizeUser: sanitizeUser,
    setMockUser: setMockUser,
    getMockUser: getMockUser
  };
})();
