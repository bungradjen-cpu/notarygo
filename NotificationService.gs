/**
 * NOTARYGO™ — Notary Office Operational Control System
 * Notification Queue & Email Deduplication Engine
 */

var NotificationService = {
  /**
   * Pushes a notification into the Notification Queue with deduplication
   */
  queueNotification: function(data) {
    if (!data || !data.recipientEmail || !data.type) return null;

    var recipientEmail = data.recipientEmail.toLowerCase().trim();
    var today = Utils.todayIsoDate();
    var dedupKey = data.deduplicationKey || (data.type + ':' + (data.entityId || 'GEN') + ':' + recipientEmail + ':' + today);

    // Deduplication check: check if already queued or sent today
    var existing = Repository.Notifications.findOne(function(n) {
      return n.deduplicationKey === dedupKey && (n.status === CONFIG.NOTIFICATION_STATUS.QUEUED || n.status === CONFIG.NOTIFICATION_STATUS.SENT || n.status === CONFIG.NOTIFICATION_STATUS.PROCESSING);
    });

    if (existing) {
      return existing; // Duplicate prevented
    }

    var newNotif = {
      notificationId: Utils.generateId(CONFIG.PREFIX.NOTIFICATION),
      recipientUserId: data.recipientUserId || '',
      recipientEmail: recipientEmail,
      type: data.type,
      entityType: data.entityType || 'GENERAL',
      entityId: data.entityId || '',
      subject: data.subject || '[NOTARYGO] Pemberitahuan Sistem',
      payloadJson: Utils.safeJsonStringify(data.payload || {}),
      scheduledAt: data.scheduledAt || Utils.nowIso(),
      status: CONFIG.NOTIFICATION_STATUS.QUEUED,
      attemptCount: 0,
      sentAt: '',
      lastError: '',
      deduplicationKey: dedupKey,
      createdAt: Utils.nowIso()
    };

    return Repository.Notifications.insert(newNotif);
  },

  /**
   * Processes all pending notifications in the queue
   * Runs via periodic trigger (e.g. every 15-30 minutes)
   */
  processQueue: function() {
    var queued = Repository.Notifications.find({ status: CONFIG.NOTIFICATION_STATUS.QUEUED });
    var processedCount = 0;
    var failedCount = 0;

    for (var i = 0; i < queued.length; i++) {
      var item = queued[i];
      try {
        Repository.Notifications.update(item.notificationId, {
          status: CONFIG.NOTIFICATION_STATUS.PROCESSING,
          attemptCount: (parseInt(item.attemptCount, 10) || 0) + 1
        });

        var payload = Utils.safeJsonParse(item.payloadJson, {});
        var bodyHtml = MailService.buildEmailHtml(item.type, item.subject, payload);

        MailService.sendEmail(item.recipientEmail, item.subject, bodyHtml);

        Repository.Notifications.update(item.notificationId, {
          status: CONFIG.NOTIFICATION_STATUS.SENT,
          sentAt: Utils.nowIso(),
          lastError: ''
        });
        processedCount++;
      } catch (err) {
        failedCount++;
        Repository.Notifications.update(item.notificationId, {
          status: CONFIG.NOTIFICATION_STATUS.FAILED,
          lastError: String(err.message || err)
        });
      }
    }

    return {
      processed: processedCount,
      failed: failedCount,
      total: queued.length
    };
  },

  /**
   * Generates and sends Owner Daily Operational Brief email (07:30 WIB)
   */
  sendOwnerDailyBrief: function() {
    var today = Utils.todayIsoDate();
    var ownerEmail = PropertiesService.getScriptProperties().getProperty(CONFIG.KEYS.OWNER_EMAIL);
    if (!ownerEmail) {
      var owner = Repository.Users.findOne({ role: CONFIG.ROLES.OWNER, status: CONFIG.USER_STATUS.ACTIVE });
      if (owner) ownerEmail = owner.email;
    }

    if (!ownerEmail) return { success: false, message: 'Owner email not found' };

    var dedupKey = 'DAILY_BRIEF:' + ownerEmail + ':' + today;
    var alreadySent = Repository.Notifications.findOne({ deduplicationKey: dedupKey, status: CONFIG.NOTIFICATION_STATUS.SENT });
    if (alreadySent) {
      return { success: true, message: 'Daily brief already sent today' };
    }

    var kpi = ReportService.getOperationalReport();
    var alerts = AlertService.getAttentionRequired();
    var todaySignings = Repository.Signing.find({ date: today, status: CONFIG.SIGNING_STATUS.READY });
    var todayFollowUps = Repository.FollowUps.find({ followUpDate: today, status: CONFIG.FOLLOW_UP_STATUS.SCHEDULED });

    var subject = '[NOTARYGO] Daily Operational Brief — ' + Utils.formatDateIndo(today);
    
    NotificationService.queueNotification({
      recipientEmail: ownerEmail,
      type: 'DAILY_BRIEF',
      entityType: 'REPORT',
      entityId: 'BRIEF_' + today,
      subject: subject,
      deduplicationKey: dedupKey,
      payload: {
        date: Utils.formatDateIndo(today),
        activeMatters: kpi.active,
        overdueMatters: kpi.overdue,
        pendingMatters: kpi.pending,
        deadlinesToday: kpi.deadlinesToday,
        signingsCount: todaySignings.length,
        followUpsCount: todayFollowUps.length,
        criticalAlertsCount: alerts.critical.length,
        topAlerts: alerts.critical.slice(0, 5)
      }
    });

    return NotificationService.processQueue();
  }
};
