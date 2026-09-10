/**
 * NOTARYGO™ — Notary Office Operational Control System
 * Mail Delivery & HTML Template Service
 */

var MailService = {
  /**
   * Sends an email via MailApp or GmailApp safely
   */
  sendEmail: function(recipientEmail, subject, htmlBody) {
    if (!recipientEmail || !Validation.isValidEmail(recipientEmail)) {
      throw new Error('Email penerima tidak valid: ' + recipientEmail);
    }

    if (Database.isMockMode()) {
      return { success: true, mock: true, recipient: recipientEmail };
    }

    try {
      MailApp.sendEmail({
        to: recipientEmail,
        subject: subject,
        htmlBody: htmlBody
      });
      return { success: true };
    } catch (e) {
      // Fallback to GmailApp if available
      try {
        GmailApp.sendEmail(recipientEmail, subject, '', { htmlBody: htmlBody });
        return { success: true };
      } catch (err2) {
        throw new Error('Gagal mengirim email: ' + err2.message);
      }
    }
  },

  /**
   * Builds clean branded responsive HTML email template
   */
  buildEmailHtml: function(type, title, payload) {
    payload = payload || {};
    var office = OfficeService.getProfile();

    var contentRows = '';
    for (var key in payload) {
      if (key !== 'topAlerts' && payload[key] !== undefined && payload[key] !== null) {
        var label = key.replace(/([A-Z])/g, ' $1').replace(/^./, function(str){ return str.toUpperCase(); });
        contentRows += '<tr>' +
          '<td style="padding: 8px 12px; color: #64748b; font-size: 13px; font-weight: 600; width: 35%; border-bottom: 1px solid #f1f5f9;">' + label + '</td>' +
          '<td style="padding: 8px 12px; color: #0f172a; font-size: 13px; border-bottom: 1px solid #f1f5f9;">' + payload[key] + '</td>' +
          '</tr>';
      }
    }

    var alertsSection = '';
    if (payload.topAlerts && Array.isArray(payload.topAlerts) && payload.topAlerts.length > 0) {
      alertsSection = '<div style="margin-top: 16px; padding: 12px; background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 4px;">' +
        '<strong style="color: #991b1b; font-size: 14px;">Perhatian Kritis Hari Ini:</strong><ul style="margin: 8px 0 0 0; padding-left: 20px; color: #b91c1c; font-size: 13px;">';
      for (var a = 0; a < payload.topAlerts.length; a++) {
        var alt = payload.topAlerts[a];
        alertsSection += '<li style="margin-bottom: 4px;"><strong>' + (alt.matterNumber || alt.entityType) + ':</strong> ' + alt.reason + '</li>';
      }
      alertsSection += '</ul></div>';
    }

    return '<!DOCTYPE html>' +
      '<html><head><meta charset="utf-8"></head>' +
      '<body style="margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc;">' +
      '<div style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">' +
      
      // Header
      '<div style="background-color: #0f172a; padding: 20px 24px; border-bottom: 3px solid #d97706;">' +
      '<div style="color: #d97706; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">' + office.officeName + '</div>' +
      '<div style="color: #ffffff; font-size: 18px; font-weight: 700; margin-top: 4px;">' + title + '</div>' +
      '<div style="color: #94a3b8; font-size: 12px; margin-top: 2px;">' + office.notaryName + '</div>' +
      '</div>' +

      // Body
      '<div style="padding: 24px;">' +
      '<table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">' +
      contentRows +
      '</table>' +
      alertsSection +
      '</div>' +

      // Footer
      '<div style="background-color: #f8fafc; padding: 16px 24px; border-top: 1px solid #e2e8f0; text-align: center;">' +
      '<p style="margin: 0; color: #94a3b8; font-size: 11px;">Powered by <strong>NOTARYGO™</strong> — Notary Office Operational Control System</p>' +
      '<p style="margin: 4px 0 0 0; color: #cbd5e1; font-size: 10px;">Email ini dihasilkan otomatis oleh sistem. Jangan membalas langsung ke alamat ini.</p>' +
      '</div>' +

      '</div></body></html>';
  }
};
