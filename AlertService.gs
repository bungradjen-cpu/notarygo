/**
 * NOTARYGO™ — Notary Office Operational Control System
 * Exception & Attention Required Engine
 */

var AlertService = {
  /**
   * Calculates deadline risk level based on configured day thresholds
   */
  getDeadlineRisk: function(deadlineStr) {
    if (!deadlineStr) return 'SAFE';
    var today = Utils.todayIsoDate();
    var diff = Utils.calculateDaysDiff(today, deadlineStr);

    if (diff < 0) return 'OVERDUE';
    if (diff <= CONFIG.THRESHOLDS.DEADLINE_CRITICAL_DAYS) return 'CRITICAL';
    if (diff <= CONFIG.THRESHOLDS.DEADLINE_WARNING_DAYS) return 'WARNING';
    if (diff <= CONFIG.THRESHOLDS.DEADLINE_WATCH_DAYS) return 'WATCH';
    return 'SAFE';
  },

  /**
   * Scans system for operational exceptions and returns categorized alerts
   * @return {Object} { critical: [], warning: [], watch: [], summary: {} }
   */
  getAttentionRequired: function() {
    var today = Utils.todayIsoDate();
    var matters = Repository.Matters.find(function(m) {
      return m.matterStatus === CONFIG.MATTER_STATUS.ACTIVE || m.matterStatus === CONFIG.MATTER_STATUS.PENDING || m.matterStatus === CONFIG.MATTER_STATUS.WAITING_APPROVAL;
    });

    var critical = [];
    var warning = [];
    var watch = [];

    // 1. Scan Matters
    for (var i = 0; i < matters.length; i++) {
      var m = matters[i];

      // Rule A: Active matter without PIC
      if (!m.assignedPIC || m.assignedPIC.trim() === '') {
        critical.push({
          alertId: 'ALT_NOPIC_' + m.matterId,
          entityType: 'MATTER',
          entityId: m.matterId,
          matterNumber: m.matterNumber,
          clientName: m.clientNameSnapshot,
          title: m.title,
          reason: 'Perkara aktif tidak memiliki PIC (Penanggung Jawab).',
          severity: CONFIG.ALERT_SEVERITY.CRITICAL,
          generatedAt: Utils.nowIso()
        });
      }

      // Rule B: Overdue or approaching deadline
      if (m.deadline) {
        var risk = this.getDeadlineRisk(m.deadline);
        var daysDiff = Utils.calculateDaysDiff(today, m.deadline);

        if (risk === 'OVERDUE') {
          critical.push({
            alertId: 'ALT_OVERDUE_' + m.matterId,
            entityType: 'MATTER',
            entityId: m.matterId,
            matterNumber: m.matterNumber,
            clientName: m.clientNameSnapshot,
            title: m.title,
            reason: 'Deadline perkara terlewat ' + Math.abs(daysDiff) + ' hari (' + Utils.formatDateIndo(m.deadline) + ').',
            severity: CONFIG.ALERT_SEVERITY.CRITICAL,
            generatedAt: Utils.nowIso()
          });
        } else if (risk === 'CRITICAL') {
          critical.push({
            alertId: 'ALT_DUECRIT_' + m.matterId,
            entityType: 'MATTER',
            entityId: m.matterId,
            matterNumber: m.matterNumber,
            clientName: m.clientNameSnapshot,
            title: m.title,
            reason: 'Deadline perkara jatuh tempo ' + (daysDiff === 0 ? 'hari ini' : 'besok (' + Utils.formatDateIndo(m.deadline) + ')') + '.',
            severity: CONFIG.ALERT_SEVERITY.CRITICAL,
            generatedAt: Utils.nowIso()
          });
        } else if (risk === 'WARNING') {
          warning.push({
            alertId: 'ALT_DUEWARN_' + m.matterId,
            entityType: 'MATTER',
            entityId: m.matterId,
            matterNumber: m.matterNumber,
            clientName: m.clientNameSnapshot,
            title: m.title,
            reason: 'Deadline perkara mendekati dalam ' + daysDiff + ' hari (' + Utils.formatDateIndo(m.deadline) + ').',
            severity: CONFIG.ALERT_SEVERITY.WARNING,
            generatedAt: Utils.nowIso()
          });
        } else if (risk === 'WATCH') {
          watch.push({
            alertId: 'ALT_DUEWATCH_' + m.matterId,
            entityType: 'MATTER',
            entityId: m.matterId,
            matterNumber: m.matterNumber,
            clientName: m.clientNameSnapshot,
            title: m.title,
            reason: 'Deadline perkara dalam ' + daysDiff + ' hari.',
            severity: CONFIG.ALERT_SEVERITY.WATCH,
            generatedAt: Utils.nowIso()
          });
        }
      }

      // Rule C: No operational update > X days (default 5 days)
      if (m.lastOperationalUpdate) {
        var daysNoUpdate = Utils.calculateDaysDiff(m.lastOperationalUpdate, today);
        if (daysNoUpdate >= CONFIG.THRESHOLDS.NO_ACTIVITY_WARNING_DAYS) {
          warning.push({
            alertId: 'ALT_NOACT_' + m.matterId,
            entityType: 'MATTER',
            entityId: m.matterId,
            matterNumber: m.matterNumber,
            clientName: m.clientNameSnapshot,
            title: m.title,
            reason: 'Tidak ada aktivitas operasional selama ' + daysNoUpdate + ' hari.',
            severity: CONFIG.ALERT_SEVERITY.WARNING,
            generatedAt: Utils.nowIso()
          });
        }
      }
    }

    // 2. Scan Pending Matters Aging
    var activePendings = Repository.Pending.find({ status: 'ACTIVE' });
    for (var p = 0; p < activePendings.length; p++) {
      var pend = activePendings[p];
      var pendDays = pend.pendingSince ? Utils.calculateDaysDiff(pend.pendingSince, today) : 0;
      var mat = Repository.Matters.getById(pend.matterId);

      if (pendDays >= CONFIG.THRESHOLDS.PENDING_CRITICAL_DAYS) {
        critical.push({
          alertId: 'ALT_PNDCRIT_' + pend.pendingId,
          entityType: 'PENDING',
          entityId: pend.pendingId,
          matterNumber: mat ? mat.matterNumber : '-',
          clientName: mat ? mat.clientNameSnapshot : '-',
          title: mat ? mat.title : '-',
          reason: 'Perkara pending terlalu lama (' + pendDays + ' hari). Alasan: ' + pend.reasonCode + ' (' + pend.reasonDetail + ')',
          severity: CONFIG.ALERT_SEVERITY.CRITICAL,
          generatedAt: Utils.nowIso()
        });
      } else if (pendDays >= CONFIG.THRESHOLDS.PENDING_WARNING_DAYS) {
        warning.push({
          alertId: 'ALT_PNDWARN_' + pend.pendingId,
          entityType: 'PENDING',
          entityId: pend.pendingId,
          matterNumber: mat ? mat.matterNumber : '-',
          clientName: mat ? mat.clientNameSnapshot : '-',
          title: mat ? mat.title : '-',
          reason: 'Perkara pending ' + pendDays + ' hari. Alasan: ' + pend.reasonCode,
          severity: CONFIG.ALERT_SEVERITY.WARNING,
          generatedAt: Utils.nowIso()
        });
      } else if (pendDays >= CONFIG.THRESHOLDS.PENDING_WATCH_DAYS) {
        watch.push({
          alertId: 'ALT_PNDWATCH_' + pend.pendingId,
          entityType: 'PENDING',
          entityId: pend.pendingId,
          matterNumber: mat ? mat.matterNumber : '-',
          clientName: mat ? mat.clientNameSnapshot : '-',
          title: mat ? mat.title : '-',
          reason: 'Perkara pending ' + pendDays + ' hari.',
          severity: CONFIG.ALERT_SEVERITY.WATCH,
          generatedAt: Utils.nowIso()
        });
      }
    }

    // 3. Scan Signing Sessions: Today / Tomorrow NOT_READY
    var upcomingSignings = Repository.Signing.find(function(s) {
      return (s.status === CONFIG.SIGNING_STATUS.SCHEDULED || s.status === CONFIG.SIGNING_STATUS.READY) && s.date >= today;
    });

    for (var s = 0; s < upcomingSignings.length; s++) {
      var sig = upcomingSignings[s];
      var signDays = Utils.calculateDaysDiff(today, sig.date);
      var evalResult = SigningService.evaluateReadiness(sig.signingId);

      if (signDays <= 1 && !evalResult.isReady) {
        var sm = Repository.Matters.getById(sig.matterId);
        critical.push({
          alertId: 'ALT_SIGNOTREADY_' + sig.signingId,
          entityType: 'SIGNING',
          entityId: sig.signingId,
          matterNumber: sm ? sm.matterNumber : '-',
          clientName: sm ? sm.clientNameSnapshot : '-',
          title: sm ? sm.title : '-',
          reason: 'Jadwal penandatanganan ' + (signDays === 0 ? 'hari ini' : 'besok (' + sig.date + ')') + ' belum siap (Kelengkapan berkas: ' + evalResult.checklistPercentage + '%).',
          severity: CONFIG.ALERT_SEVERITY.CRITICAL,
          generatedAt: Utils.nowIso()
        });
      }
    }

    return {
      critical: critical,
      warning: warning,
      watch: watch,
      summary: {
        total: critical.length + warning.length + watch.length,
        criticalCount: critical.length,
        warningCount: warning.length,
        watchCount: watch.length
      }
    };
  }
};
