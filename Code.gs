/**
 * NOTARYGO™ — Notary Office Operational Control System
 * Main WebApp Controller & Public API Dispatcher
 * Version: 2.0.0
 */

/**
 * WebApp HTTP Entrypoint
 */
function doGet(e) {
  var template = HtmlService.createTemplateFromFile('Index');
  template.appName = CONFIG.APP_NAME;
  template.appVersion = CONFIG.VERSION;

  return template.evaluate()
    .setTitle(CONFIG.APP_NAME + ' — ' + CONFIG.TAGLINE)
    .setFaviconUrl('https://ssl.gstatic.com/docs/doclist/images/infinite_drive_2020q4.ico')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Helper to include HTML component files into templates
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Top-Level System Setup & Administrative Entrypoints
 */
function initializeNotaryGo(ownerEmail, ownerName) {
  return Bootstrap.initializeNotaryGo(ownerEmail, ownerName);
}

function setupDatabase() {
  return Database.setupDatabase();
}

function setupDrive() {
  return DriveService.setupDriveStructure();
}

function setupTriggers() {
  return Bootstrap.setupTriggers();
}

function runHealthCheck() {
  return HealthService.runHealthCheck();
}

function runAllTests() {
  return Tests.runAllTests();
}

function seedDemoData() {
  return Bootstrap.seedDemoData();
}

/**
 * Periodic Time-Driven Trigger Callbacks
 */
function processNotificationQueueTrigger() {
  return NotificationService.processQueue();
}

function sendDailyBriefTrigger() {
  return NotificationService.sendOwnerDailyBrief();
}

function runDailyBackupTrigger() {
  return BackupService.createBackup('Automated Daily Backup');
}

/**
 * Standard Error Wrapper for API Dispatchers
 */
function handleApiCall(fn) {
  var reqId = Utils.generateRequestId();
  try {
    var result = fn(reqId);
    return Utils.createResponse(result, 'Sukses', reqId);
  } catch (err) {
    return Utils.createErrorResponse('API_ERROR', err.message || String(err), reqId);
  }
}

// ==========================================
// PUBLIC RPC DISPATCHERS FOR CLIENT-SIDE UI
// ==========================================

function apiLogin(email, password) {
  return handleApiCall(function(reqId) {
    return Auth.login(email, password, reqId);
  });
}

function apiGetInitialState(clientEmail) {
  return handleApiCall(function() {
    var user = Auth.getCurrentUser(clientEmail);
    var office = OfficeService.getProfile();
    var serviceTypes = Repository.ServiceTypes.getAll().filter(function(s){ return s.active !== false; });
    var staffList = UserService.getActiveStaffList();
    var alerts = AlertService.getAttentionRequired();
    var orgs = Repository.Organizations.find({ status: 'ACTIVE' });

    return {
      currentUser: Auth.sanitizeUser(user),
      identityDiag: Auth.getIdentityDiagnostic(clientEmail),
      office: office,
      serviceTypes: serviceTypes,
      staffList: staffList,
      organizations: orgs,
      alertCount: alerts.summary.criticalCount + alerts.summary.warningCount,
      criticalAlerts: alerts.critical
    };
  });
}

function apiGetDashboardData() {
  return handleApiCall(function() {
    var kpi = ReportService.getOperationalReport();
    var alerts = AlertService.getAttentionRequired();
    var aging = ReportService.getAgingReport();
    var workload = ReportService.getStaffWorkloadReport();
    var recentMatters = MatterService.getMatters({ includeArchived: false }).slice(0, 8);

    return {
      kpi: kpi,
      alerts: alerts,
      aging: aging,
      workload: workload,
      recentMatters: recentMatters
    };
  });
}

function apiGetMyWork(userEmail) {
  return handleApiCall(function() {
    return TaskService.getMyWorkData(userEmail);
  });
}

function apiGetAttentionRequired() {
  return handleApiCall(function() {
    return AlertService.getAttentionRequired();
  });
}

function apiGetMatters(filter) {
  return handleApiCall(function() {
    return MatterService.getMatters(filter);
  });
}

function apiGetMatterDetail(matterId) {
  return handleApiCall(function() {
    return MatterService.getMatterDetail(matterId);
  });
}

function apiCreateMatter(data) {
  return handleApiCall(function(reqId) {
    return MatterService.createMatter(data, reqId);
  });
}

function apiUpdateMatter(matterId, data) {
  return handleApiCall(function(reqId) {
    return MatterService.updateMatter(matterId, data, reqId);
  });
}

function apiCancelMatter(matterId, reason, note) {
  return handleApiCall(function(reqId) {
    return MatterService.cancelMatter(matterId, reason, note, reqId);
  });
}

function apiArchiveMatter(matterId, reason) {
  return handleApiCall(function(reqId) {
    return MatterService.archiveMatter(matterId, reason, reqId);
  });
}

function apiRestoreMatter(matterId, reason) {
  return handleApiCall(function(reqId) {
    return MatterService.restoreMatter(matterId, reason, reqId);
  });
}

function apiTransitionWorkflow(matterId, targetStepCode, note, isOverride, overrideReason) {
  return handleApiCall(function(reqId) {
    return WorkflowService.transitionWorkflow(matterId, targetStepCode, note, isOverride, overrideReason, reqId);
  });
}

function apiGetTasks(filter) {
  return handleApiCall(function() {
    return TaskService.getTasks(filter);
  });
}

function apiCreateTask(data) {
  return handleApiCall(function(reqId) {
    return TaskService.createTask(data, reqId);
  });
}

function apiUpdateTask(taskId, data) {
  return handleApiCall(function(reqId) {
    return TaskService.updateTask(taskId, data, reqId);
  });
}

function apiCompleteTask(taskId, note) {
  return handleApiCall(function(reqId) {
    return TaskService.completeTask(taskId, note, reqId);
  });
}

function apiGetPendingList() {
  return handleApiCall(function() {
    return PendingService.getAllPending();
  });
}

function apiSetMatterPending(data) {
  return handleApiCall(function(reqId) {
    return PendingService.setMatterPending(data, reqId);
  });
}

function apiResolvePending(pendingId, note) {
  return handleApiCall(function(reqId) {
    return PendingService.resolvePending(pendingId, note, reqId);
  });
}

function apiGetFollowUps(filter) {
  return handleApiCall(function() {
    return FollowUpService.getFollowUps(filter);
  });
}

function apiCreateFollowUp(data) {
  return handleApiCall(function(reqId) {
    return FollowUpService.createFollowUp(data, reqId);
  });
}

function apiCompleteFollowUp(followUpId, result, nextDate) {
  return handleApiCall(function(reqId) {
    return FollowUpService.completeFollowUp(followUpId, result, nextDate, reqId);
  });
}

function apiUpdateChecklistItem(checklistItemId, status, note, driveFileId, driveFileUrl) {
  return handleApiCall(function(reqId) {
    return ChecklistService.updateChecklistItem(checklistItemId, status, note, driveFileId, driveFileUrl, reqId);
  });
}

function apiAddChecklistItem(matterId, documentType, required, note) {
  return handleApiCall(function(reqId) {
    return ChecklistService.addChecklistItem(matterId, documentType, required, note, reqId);
  });
}

function apiGetDocumentRequestText(matterId) {
  return handleApiCall(function() {
    return ChecklistService.generateDocumentRequestText(matterId);
  });
}

function apiGetDocuments(filter) {
  return handleApiCall(function() {
    return DocumentService.getDocuments(filter);
  });
}

function apiRegisterDocument(data) {
  return handleApiCall(function(reqId) {
    return DocumentService.registerDocument(data, reqId);
  });
}

function apiUpdateDocumentStatus(documentId, status, notes) {
  return handleApiCall(function(reqId) {
    return DocumentService.updateDocumentStatus(documentId, status, notes, reqId);
  });
}

function apiGetApprovals(filter) {
  return handleApiCall(function() {
    return ApprovalService.getApprovals(filter);
  });
}

function apiRequestApproval(data) {
  return handleApiCall(function(reqId) {
    return ApprovalService.requestApproval(data, reqId);
  });
}

function apiRespondApproval(approvalId, decision, comment) {
  return handleApiCall(function(reqId) {
    return ApprovalService.respondApproval(approvalId, decision, comment, reqId);
  });
}

function apiGetSignings(filter) {
  return handleApiCall(function() {
    return SigningService.getSignings(filter);
  });
}

function apiScheduleSigning(data) {
  return handleApiCall(function(reqId) {
    return SigningService.scheduleSigning(data, reqId);
  });
}

function apiUpdateSigningStatus(signingId, status, notes) {
  return handleApiCall(function(reqId) {
    return SigningService.updateSigningStatus(signingId, status, notes, reqId);
  });
}

function apiEvaluateSigningReadiness(signingId) {
  return handleApiCall(function() {
    return SigningService.evaluateReadiness(signingId);
  });
}

function apiGetClients() {
  return handleApiCall(function() {
    return ClientService.getAllClients();
  });
}

function apiGetClientDetail(clientId) {
  return handleApiCall(function() {
    return ClientService.getClientDetail(clientId);
  });
}

function apiCreateClient(data) {
  return handleApiCall(function(reqId) {
    return ClientService.createClient(data, reqId);
  });
}

function apiUpdateClient(clientId, data) {
  return handleApiCall(function(reqId) {
    return ClientService.updateClient(clientId, data, reqId);
  });
}

function apiGetIntakes() {
  return handleApiCall(function() {
    return ClientService.getAllIntakes();
  });
}

function apiCreateIntake(data) {
  return handleApiCall(function(reqId) {
    return ClientService.createIntake(data, reqId);
  });
}

function apiUpdateIntake(intakeId, data) {
  return handleApiCall(function(reqId) {
    return ClientService.updateIntake(intakeId, data, reqId);
  });
}

function apiConvertIntakeToMatter(intakeId, options) {
  return handleApiCall(function(reqId) {
    return ClientService.convertIntakeToMatter(intakeId, options, reqId);
  });
}

function apiGetOrganizations() {
  return handleApiCall(function() {
    return OrganizationService.getAllOrganizations();
  });
}

function apiGetOrganizationDetail(orgId) {
  return handleApiCall(function() {
    return OrganizationService.getOrganizationDetail(orgId);
  });
}

function apiCreateOrganization(data) {
  return handleApiCall(function(reqId) {
    return OrganizationService.createOrganization(data, reqId);
  });
}

function apiUpdateOrganization(orgId, data) {
  return handleApiCall(function(reqId) {
    return OrganizationService.updateOrganization(orgId, data, reqId);
  });
}

function apiGetCommunications(matterId) {
  return handleApiCall(function() {
    return CommunicationService.getMatterCommunications(matterId);
  });
}

function apiLogCommunication(data) {
  return handleApiCall(function(reqId) {
    return CommunicationService.logCommunication(data, reqId);
  });
}

function apiGetInvoices(filter) {
  return handleApiCall(function() {
    return BillingService.getInvoices(filter);
  });
}

function apiGetInvoiceDetail(invoiceId) {
  return handleApiCall(function() {
    return BillingService.getInvoiceDetail(invoiceId);
  });
}

function apiCreateInvoice(data) {
  return handleApiCall(function(reqId) {
    return BillingService.createInvoice(data, reqId);
  });
}

function apiRecordPayment(data) {
  return handleApiCall(function(reqId) {
    return BillingService.recordPayment(data, reqId);
  });
}

function apiGetPdfHtml(docType, entityId) {
  return handleApiCall(function() {
    if (docType === 'INVOICE') return PdfService.generateInvoiceHtml(entityId);
    if (docType === 'RECEIPT') return PdfService.generateReceiptHtml(entityId);
    if (docType === 'CHECKLIST') return PdfService.generateChecklistHtml(entityId);
    if (docType === 'TASK') return PdfService.generateTaskSheetHtml(entityId);
    throw new Error('Jenis dokumen tidak didukung: ' + docType);
  });
}

function apiGetReports(reportType) {
  return handleApiCall(function() {
    if (reportType === 'OPERATIONAL') return ReportService.getOperationalReport();
    if (reportType === 'AGING') return ReportService.getAgingReport();
    if (reportType === 'WORKLOAD') return ReportService.getStaffWorkloadReport();
    if (reportType === 'SERVICES') return ReportService.getServiceTypeReport();
    return ReportService.getOperationalReport();
  });
}

function apiGetActivityLogs(filter) {
  return handleApiCall(function() {
    return AuditService.getLogs(filter);
  });
}

function apiGetUsers() {
  return handleApiCall(function() {
    return UserService.getAllUsers();
  });
}

function apiCreateUser(data) {
  return handleApiCall(function(reqId) {
    return UserService.createUser(data, reqId);
  });
}

function apiUpdateUser(userId, data) {
  return handleApiCall(function(reqId) {
    return UserService.updateUser(userId, data, reqId);
  });
}

function apiResetUserPassword(userId, newPassword) {
  return handleApiCall(function(reqId) {
    return UserService.resetUserPassword(userId, newPassword, reqId);
  });
}

function apiChangePassword(userId, oldPassword, newPassword) {
  return handleApiCall(function(reqId) {
    return UserService.changePassword(userId, oldPassword, newPassword, reqId);
  });
}

function apiDeactivateUser(userId) {
  return handleApiCall(function(reqId) {
    return UserService.deactivateUser(userId, reqId);
  });
}

function apiHandoverStaff(fromEmail, toEmail) {
  return handleApiCall(function(reqId) {
    return UserService.handoverResponsibilities(fromEmail, toEmail, reqId);
  });
}

function apiGetOfficeProfile() {
  return handleApiCall(function() {
    return OfficeService.getProfile();
  });
}

function apiUpdateOfficeProfile(data) {
  return handleApiCall(function(reqId) {
    return OfficeService.updateProfile(data, reqId);
  });
}

function apiCreateBackup(notes) {
  return handleApiCall(function() {
    return BackupService.createBackup(notes);
  });
}

function apiGetBackupHistory() {
  return handleApiCall(function() {
    return BackupService.getBackupHistory();
  });
}

function apiRunHealthCheck() {
  return handleApiCall(function() {
    return HealthService.runHealthCheck();
  });
}

function apiUpdateClient(clientId, data) {
  return handleApiCall(function(reqId) {
    return ClientService.updateClient(clientId, data, reqId);
  });
}

function apiDeleteClient(clientId) {
  return handleApiCall(function(reqId) {
    return ClientService.deleteClient(clientId, reqId);
  });
}

function apiCreateOrganization(data) {
  return handleApiCall(function(reqId) {
    return OrganizationService.createOrganization(data, reqId);
  });
}

function apiUpdateOrganization(orgId, data) {
  return handleApiCall(function(reqId) {
    return OrganizationService.updateOrganization(orgId, data, reqId);
  });
}

function apiDeleteOrganization(orgId) {
  return handleApiCall(function(reqId) {
    return OrganizationService.deleteOrganization(orgId, reqId);
  });
}

function apiDeleteMatter(matterId) {
  return handleApiCall(function(reqId) {
    return MatterService.deleteMatter(matterId, reqId);
  });
}

function apiDeleteTask(taskId) {
  return handleApiCall(function(reqId) {
    return TaskService.deleteTask(taskId, reqId);
  });
}

function apiUpdateInvoice(invoiceId, data) {
  return handleApiCall(function(reqId) {
    return BillingService.updateInvoice(invoiceId, data, reqId);
  });
}

function apiDeleteInvoice(invoiceId) {
  return handleApiCall(function(reqId) {
    return BillingService.deleteInvoice(invoiceId, reqId);
  });
}

function apiUpdateDocument(documentId, data) {
  return handleApiCall(function(reqId) {
    return DocumentService.updateDocument(documentId, data, reqId);
  });
}

function apiDeleteDocument(documentId) {
  return handleApiCall(function(reqId) {
    return DocumentService.deleteDocument(documentId, reqId);
  });
}

function apiPurgeOperationalData() {
  return handleApiCall(function() {
    Security.requireAuth();
    var user = Security.requirePermission(Permissions.LIST.SUPER_ADMIN);
    return Database.purgeOperationalData();
  });
}
