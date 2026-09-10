/**
 * NOTARYGO™ — Notary Office Operational Control System
 * Operational Reports & Staff Workload Analytics Engine
 */

var ReportService = {
  /**
   * Retrieves operational summary metrics for Dashboard and Control reports
   */
  getOperationalReport: function() {
    Security.requireAuth();
    var today = Utils.todayIsoDate();
    var allMatters = Repository.Matters.getAll();

    var active = 0;
    var completed = 0;
    var cancelled = 0;
    var pending = 0;
    var overdue = 0;
    var deadlinesToday = 0;
    var deadlinesNext7Days = 0;
    var noPic = 0;
    var noActivity5Days = 0;

    for (var i = 0; i < allMatters.length; i++) {
      var m = allMatters[i];
      if (m.matterStatus === CONFIG.MATTER_STATUS.ACTIVE || m.matterStatus === CONFIG.MATTER_STATUS.PENDING || m.matterStatus === CONFIG.MATTER_STATUS.WAITING_APPROVAL) {
        active++;
        if (!m.assignedPIC || m.assignedPIC.trim() === '') noPic++;

        if (m.deadline) {
          var diff = Utils.calculateDaysDiff(today, m.deadline);
          if (diff < 0) overdue++;
          if (diff === 0) deadlinesToday++;
          if (diff >= 0 && diff <= 7) deadlinesNext7Days++;
        }

        if (m.lastOperationalUpdate) {
          var noActDiff = Utils.calculateDaysDiff(m.lastOperationalUpdate, today);
          if (noActDiff >= 5) noActivity5Days++;
        }

        if (m.matterStatus === CONFIG.MATTER_STATUS.PENDING) pending++;
      } else if (m.matterStatus === CONFIG.MATTER_STATUS.COMPLETED) {
        completed++;
      } else if (m.matterStatus === CONFIG.MATTER_STATUS.CANCELLED) {
        cancelled++;
      }
    }

    var openTasks = Repository.Tasks.find(function(t) {
      return t.status !== CONFIG.TASK_STATUS.DONE && t.status !== CONFIG.TASK_STATUS.CANCELLED;
    });
    var overdueTasks = openTasks.filter(function(t) {
      return t.deadline && t.deadline < today;
    }).length;

    var todaySignings = Repository.Signing.find({ date: today, status: CONFIG.SIGNING_STATUS.READY }).length;
    var todayFollowUps = Repository.FollowUps.find({ followUpDate: today, status: CONFIG.FOLLOW_UP_STATUS.SCHEDULED }).length;

    // Financial summaries
    var allInvoices = Repository.Invoices.getAll();
    var outstandingTotal = 0;
    for (var j = 0; j < allInvoices.length; j++) {
      var inv = allInvoices[j];
      if (inv.status !== CONFIG.INVOICE_STATUS.PAID && inv.status !== CONFIG.INVOICE_STATUS.CANCELLED) {
        outstandingTotal += Utils.parseCurrency(inv.outstanding);
      }
    }

    return {
      active: active,
      completed: completed,
      cancelled: cancelled,
      pending: pending,
      overdue: overdue,
      deadlinesToday: deadlinesToday,
      deadlinesNext7Days: deadlinesNext7Days,
      noPic: noPic,
      noActivity5Days: noActivity5Days,
      overdueTasks: overdueTasks,
      todaySignings: todaySignings,
      todayFollowUps: todayFollowUps,
      outstandingTotal: outstandingTotal
    };
  },

  /**
   * Calculates Matter Aging distribution buckets
   */
  getAgingReport: function() {
    Security.requireAuth();
    var today = Utils.todayIsoDate();
    var activeMatters = Repository.Matters.find(function(m) {
      return m.matterStatus === CONFIG.MATTER_STATUS.ACTIVE || m.matterStatus === CONFIG.MATTER_STATUS.PENDING || m.matterStatus === CONFIG.MATTER_STATUS.WAITING_APPROVAL;
    });

    var buckets = {
      '0-7 Hari': 0,
      '8-14 Hari': 0,
      '15-30 Hari': 0,
      '31-60 Hari': 0,
      '>60 Hari': 0
    };

    for (var i = 0; i < activeMatters.length; i++) {
      var m = activeMatters[i];
      var days = Utils.calculateDaysDiff(m.createdAt, today);
      if (days <= 7) buckets['0-7 Hari']++;
      else if (days <= 14) buckets['8-14 Hari']++;
      else if (days <= 30) buckets['15-30 Hari']++;
      else if (days <= 60) buckets['31-60 Hari']++;
      else buckets['>60 Hari']++;
    }

    return buckets;
  },

  /**
   * Retrieves Staff Workload analytics matrix
   */
  getStaffWorkloadReport: function() {
    Security.requireAuth();
    var today = Utils.todayIsoDate();
    var users = Repository.Users.find({ status: CONFIG.USER_STATUS.ACTIVE });
    var workload = [];

    for (var i = 0; i < users.length; i++) {
      var u = users[i];
      var email = u.email.toLowerCase();

      var mattersCount = Repository.Matters.find(function(m) {
        return m.assignedPIC && m.assignedPIC.toLowerCase() === email && (m.matterStatus === CONFIG.MATTER_STATUS.ACTIVE || m.matterStatus === CONFIG.MATTER_STATUS.PENDING);
      }).length;

      var tasks = Repository.Tasks.find(function(t) {
        return t.assignedTo && t.assignedTo.toLowerCase() === email && t.status !== CONFIG.TASK_STATUS.DONE && t.status !== CONFIG.TASK_STATUS.CANCELLED;
      });

      var overdueTasks = tasks.filter(function(t) {
        return t.deadline && t.deadline < today;
      }).length;

      var followUpsCount = Repository.FollowUps.find(function(f) {
        return f.PIC && f.PIC.toLowerCase() === email && f.status === CONFIG.FOLLOW_UP_STATUS.SCHEDULED;
      }).length;

      var signingsCount = Repository.Signing.find(function(s) {
        return s.PIC && s.PIC.toLowerCase() === email && (s.status === CONFIG.SIGNING_STATUS.SCHEDULED || s.status === CONFIG.SIGNING_STATUS.READY);
      }).length;

      workload.push({
        userId: u.userId,
        name: u.name,
        email: u.email,
        role: u.role,
        activeMatters: mattersCount,
        openTasks: tasks.length,
        overdueTasks: overdueTasks,
        followUps: followUpsCount,
        signings: signingsCount
      });
    }

    return workload.sort(function(a, b) {
      return (b.activeMatters + b.openTasks) - (a.activeMatters + a.openTasks);
    });
  },

  /**
   * Retrieves Service Type distribution report
   */
  getServiceTypeReport: function() {
    Security.requireAuth();
    var serviceTypes = Repository.ServiceTypes.getAll();
    var matters = Repository.Matters.getAll();

    var report = [];
    for (var s = 0; s < serviceTypes.length; s++) {
      var st = serviceTypes[s];
      var stMatters = matters.filter(function(m) {
        return m.serviceTypeId === st.serviceTypeId;
      });

      var active = stMatters.filter(function(m) {
        return m.matterStatus === CONFIG.MATTER_STATUS.ACTIVE || m.matterStatus === CONFIG.MATTER_STATUS.PENDING;
      }).length;

      var completed = stMatters.filter(function(m) {
        return m.matterStatus === CONFIG.MATTER_STATUS.COMPLETED;
      }).length;

      report.push({
        serviceTypeId: st.serviceTypeId,
        name: st.name,
        totalMatters: stMatters.length,
        activeMatters: active,
        completedMatters: completed
      });
    }

    return report.sort(function(a, b) {
      return b.totalMatters - a.totalMatters;
    });
  }
};
