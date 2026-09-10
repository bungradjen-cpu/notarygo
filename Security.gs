/**
 * NOTARYGO™ — Notary Office Operational Control System
 * Security Guards & Multi-Tier Authorization Checks
 */

var Security = {
  /**
   * Enforces that a valid active user is authenticated
   * @throws {Error} If unauthenticated or inactive
   * @return {Object} Authenticated user
   */
  requireAuth: function() {
    var user = Auth.getCurrentUser();
    if (!user) {
      var diag = Auth.getIdentityDiagnostic();
      if (!diag.googleEmail || diag.googleEmail === 'TIDAK_TERDETEKSI') {
        throw new Error('UNAUTHENTICATED: Akun Google tidak terdeteksi. Pastikan Anda membuka aplikasi dengan akun Google yang valid.');
      } else if (!diag.isRegistered) {
        throw new Error('ACCESS_DENIED: Akun Google Anda (' + diag.googleEmail + ') belum terdaftar di sistem NOTARYGO™. Silakan hubungi Notaris/Owner untuk didaftarkan.');
      } else if (!diag.isActive) {
        throw new Error('USER_INACTIVE: Akun Anda (' + diag.googleEmail + ') saat ini berstatus non-aktif. Silakan hubungi Notaris/Owner.');
      }
      throw new Error('UNAUTHENTICATED: Akses ditolak.');
    }
    return user;
  },

  /**
   * Enforces that current user possesses at least one of the allowed roles
   * @param {Array<string>|string} allowedRoles
   * @return {Object} Authenticated user
   */
  requireRole: function(allowedRoles) {
    var user = this.requireAuth();
    var roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    if (roles.indexOf(user.role) === -1) {
      throw new Error('FORBIDDEN: Peran ' + user.role + ' tidak memiliki izin untuk melakukan tindakan ini. Diperlukan peran: ' + roles.join(', '));
    }
    return user;
  },

  /**
   * Enforces a specific RBAC permission
   * @param {string} permission
   * @return {Object} Authenticated user
   */
  requirePermission: function(permission) {
    var user = this.requireAuth();
    if (!Permissions.hasPermission(user.role, permission)) {
      throw new Error('FORBIDDEN: Anda tidak memiliki izin (' + permission + ') untuk melakukan tindakan ini.');
    }
    return user;
  },

  /**
   * Checks whether the user can access a specific matter
   * @param {Object} user
   * @param {Object} matter
   * @return {boolean}
   */
  canAccessMatter: function(user, matter) {
    if (!user || !matter) return false;
    if (Permissions.hasPermission(user.role, Permissions.LIST.MATTER_VIEW_ALL)) {
      return true;
    }
    // Staff can access if assigned as PIC or supervisor
    var userEmail = (user.email || '').toLowerCase();
    var userName = (user.name || '').toLowerCase();
    var assigned = (matter.assignedPIC || '').toLowerCase();
    var supervisor = (matter.supervisor || '').toLowerCase();

    return assigned === userEmail || assigned === userName || supervisor === userEmail || supervisor === userName;
  }
};
