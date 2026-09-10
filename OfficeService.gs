/**
 * NOTARYGO™ — Notary Office Operational Control System
 * Office Profile & Branding Service
 */

var OfficeService = {
  /**
   * Retrieves current Office Profile with default fallbacks
   * @return {Object}
   */
  getProfile: function() {
    var profile = Repository.Office.getProfile();
    if (!profile) {
      return {
        officeId: 'OFF_DEFAULT',
        officeName: 'Kantor Notaris & PPAT',
        notaryName: 'Nama Notaris, S.H., M.Kn.',
        notaryTitle: 'Notaris & Pejabat Pembuat Akta Tanah (PPAT)',
        address: 'Jl. Protokol No. 1',
        city: 'Jakarta Selatan',
        province: 'DKI Jakarta',
        postalCode: '12190',
        phone: '021-5550199',
        whatsapp: '081234567890',
        email: 'info@kantornotaris.com',
        website: 'https://kantornotaris.com',
        logoFileId: '',
        footerText: 'Dokumen ini diterbitkan secara sah oleh Kantor Notaris & PPAT melalui NOTARYGO™.',
        bankName: 'BCA',
        bankAccount: '1234567890',
        bankAccountName: 'Kantor Notaris & PPAT',
        invoicePrefix: 'INV/NG',
        matterPrefix: 'NG',
        timezone: CONFIG.TIMEZONE
      };
    }
    return profile;
  },

  /**
   * Updates Office Profile
   * @param {Object} data
   * @param {string} [requestId]
   * @return {Object}
   */
  updateProfile: function(data, requestId) {
    var user = Security.requireRole(CONFIG.ROLES.OWNER);
    Validation.requireFields(data, ['officeName', 'notaryName']);

    var before = Repository.Office.getProfile();
    var saved = Repository.Office.saveProfile(data, user.email);

    AuditService.log({
      actorUserId: user.userId,
      actorEmail: user.email,
      action: 'UPDATE_OFFICE_PROFILE',
      entityType: 'OFFICE',
      entityId: saved.officeId || 'OFF_PROFILE',
      beforeSnapshot: before,
      afterSnapshot: saved,
      description: 'Memperbarui profil kantor & branding: ' + data.officeName,
      requestId: requestId
    });

    return saved;
  }
};
