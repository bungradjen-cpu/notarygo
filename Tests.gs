/**
 * NOTARYGO™ — Notary Office Operational Control System
 * Comprehensive Automated Test Suite
 * Entrypoint: runAllTests()
 */

var Tests = (function() {
  function assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  }

  function assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error((message || 'Equality assertion failed') + ' [Expected: ' + expected + ', Actual: ' + actual + ']');
    }
  }

  /**
   * Runs test runner with isolated mock database
   */
  function runAllTests() {
    var startTime = new Date().getTime();
    var results = [];
    var passedCount = 0;
    var failedCount = 0;

    var testSuite = [
      { name: 'Database Setup & Schema Idempotency', fn: testDatabaseSetup },
      { name: 'Authentication & Security Privilege Escalation Guard', fn: testAuthAndSecurity },
      { name: 'Atomic Number Sequences (Matter, Invoice, Task)', fn: testSequenceGeneration },
      { name: 'Matter Lifecycle (Create, Cancel, Archive, Restore)', fn: testMatterLifecycle },
      { name: 'Workflow State Machine & Transition Rules', fn: testWorkflowEngine },
      { name: 'Task Management & My Work Urgency Sorting', fn: testTaskManagement },
      { name: 'Pending Control, Aging & Resolution', fn: testPendingControl },
      { name: 'Checklist Materialization & Completeness %', fn: testChecklistCompleteness },
      { name: 'Financial Engine (Invoice, Partial/Full Payment, Receipt)', fn: testFinancialEngine },
      { name: 'Notification Queue & Deduplication Engine', fn: testNotificationDeduplication },
      { name: 'Signing Schedule & Readiness Evaluation', fn: testSigningReadiness },
      { name: 'Staff Handover Reassignment Engine', fn: testStaffHandover },
      { name: 'Append-Only Audit Log Integrity', fn: testAuditTrail },
      { name: 'System Diagnostics & Health Check', fn: testHealthCheck },
      { name: 'Credential Login, Password Hashing & Super Admin Reset', fn: testCredentialLoginAndAdminReset }
    ];

    // Enable Mock Mode for pure isolated test execution
    var wasMock = Database.isMockMode();
    Database.setMockMode(true);

    for (var i = 0; i < testSuite.length; i++) {
      var t = testSuite[i];
      var tStart = new Date().getTime();
      try {
        t.fn();
        var tDuration = new Date().getTime() - tStart;
        results.push({ name: t.name, status: 'PASSED', durationMs: tDuration, error: null });
        passedCount++;
      } catch (err) {
        var tDurationFail = new Date().getTime() - tStart;
        results.push({ name: t.name, status: 'FAILED', durationMs: tDurationFail, error: err.message || String(err) });
        failedCount++;
      }
    }

    if (!wasMock) {
      Database.setMockMode(false);
    }

    var totalDuration = new Date().getTime() - startTime;

    var report = {
      success: failedCount === 0,
      passed: passedCount,
      failed: failedCount,
      total: testSuite.length,
      executionTimeMs: totalDuration,
      timestamp: Utils.nowIso(),
      details: results
    };

    return report;
  }

  function setupTestEnvironment() {
    Database.setMockMode(true);
    Database.resetMockStore();
    Bootstrap.initializeNotaryGo('owner.test@kantornotaris.com', 'Notaris Penguji, S.H., M.Kn.');
  }

  function testDatabaseSetup() {
    setupTestEnvironment();
    var setup1 = Database.setupDatabase();
    assert(setup1.success, 'First setupDatabase must succeed');

    // Run second time to verify idempotency
    var setup2 = Database.setupDatabase();
    assert(setup2.success, 'Second setupDatabase must succeed idempotently');

    var mockStore = Database.getMockStore();
    var canonicalSheets = Object.keys(SCHEMA);
    assertEqual(canonicalSheets.length, 27, 'Exact 27 canonical sheets must be defined in schema');

    for (var i = 0; i < canonicalSheets.length; i++) {
      var sName = canonicalSheets[i];
      assert(mockStore[sName] !== undefined, 'Sheet ' + sName + ' must exist in mock database store');
    }
  }

  function testAuthAndSecurity() {
    setupTestEnvironment();

    // 1. Unregistered user check
    Auth.setMockUser(null);
    var unauthPassed = false;
    try {
      Security.requireAuth();
    } catch (e) {
      unauthPassed = true;
    }
    assert(unauthPassed, 'Unauthenticated user must be blocked');

    // 2. Inactive user check
    var inactiveStaff = { userId: 'USR_INACT', email: 'inactive@kantornotaris.com', name: 'Inactive Staff', role: CONFIG.ROLES.STAFF, status: CONFIG.USER_STATUS.INACTIVE };
    Auth.setMockUser(inactiveStaff);
    var inactivePassed = false;
    try {
      Security.requireAuth();
    } catch (e) {
      inactivePassed = true;
    }
    assert(inactivePassed, 'Inactive user must be blocked');

    // 3. Staff privilege escalation check (Staff cannot do Owner actions)
    var activeStaff = { userId: 'USR_STAFF_TEST', email: 'staff.test@kantornotaris.com', name: 'Active Staff', role: CONFIG.ROLES.STAFF, status: CONFIG.USER_STATUS.ACTIVE };
    Auth.setMockUser(activeStaff);

    var escalationBlocked = false;
    try {
      OfficeService.updateProfile({ officeName: 'Hacked Office', notaryName: 'Hacker' }, 'REQ_TEST');
    } catch (e) {
      escalationBlocked = true;
    }
    assert(escalationBlocked, 'Staff must be blocked from updating Office Profile (Owner-only)');

    // 4. Owner access check
    var activeOwner = { userId: 'USR_OWNER_TEST', email: 'owner.test@kantornotaris.com', name: 'Active Owner', role: CONFIG.ROLES.OWNER, status: CONFIG.USER_STATUS.ACTIVE };
    Auth.setMockUser(activeOwner);
    var updatedProf = OfficeService.updateProfile({ officeName: 'Kantor Notaris Terpercaya', notaryName: 'Hj. Siti Rahmawati, S.H., M.Kn.' }, 'REQ_TEST');
    assertEqual(updatedProf.officeName, 'Kantor Notaris Terpercaya', 'Owner must be authorized to update office profile');
  }

  function testSequenceGeneration() {
    setupTestEnvironment();
    var mat1 = Sequence.nextMatterNumber('NG');
    var mat2 = Sequence.nextMatterNumber('NG');
    var year = new Date().getFullYear();

    assertEqual(mat1, 'NG-' + year + '-000001', 'First matter sequence format mismatch');
    assertEqual(mat2, 'NG-' + year + '-000002', 'Second matter sequence format mismatch');

    var inv1 = Sequence.nextInvoiceNumber('INV/NG');
    var inv2 = Sequence.nextInvoiceNumber('INV/NG');
    assertEqual(inv1, 'INV/NG/' + year + '/00001', 'First invoice sequence format mismatch');
    assertEqual(inv2, 'INV/NG/' + year + '/00002', 'Second invoice sequence format mismatch');
  }

  function testMatterLifecycle() {
    setupTestEnvironment();
    var owner = { userId: 'USR_OWNER_TEST', email: 'owner.test@kantornotaris.com', name: 'Owner Test', role: CONFIG.ROLES.OWNER, status: CONFIG.USER_STATUS.ACTIVE };
    Auth.setMockUser(owner);

    var client = ClientService.createClient({ name: 'Budi Santoso', phone: '08123456789' }, 'REQ_T');
    var matter = MatterService.createMatter({
      clientId: client.clientId,
      serviceTypeId: 'ST_AJB',
      title: 'AJB Tanah & Bangunan Budi',
      deadline: '2026-09-30'
    }, 'REQ_T');

    assert(matter.matterId && matter.matterNumber, 'Matter must be created with ID and MatterNumber');
    assertEqual(matter.matterStatus, CONFIG.MATTER_STATUS.ACTIVE, 'New matter status must be ACTIVE');
    assertEqual(matter.currentWorkflowStep, 'INCOMING', 'Initial step must be INCOMING');

    // Test Cancel Matter
    var cancelled = MatterService.cancelMatter(matter.matterId, 'CLIENT_CANCELLED', 'Batal sepihak', 'REQ_T');
    assertEqual(cancelled.matterStatus, CONFIG.MATTER_STATUS.CANCELLED, 'Cancelled matter status must be CANCELLED');

    // Cancelled matter must not appear in active matters list
    var activeMatters = MatterService.getMatters({ status: 'ACTIVE_ONLY' });
    var foundInActive = activeMatters.some(function(m){ return m.matterId === matter.matterId; });
    assert(!foundInActive, 'Cancelled matter must not appear in active matters list');

    // Test Restore Matter
    var restored = MatterService.restoreMatter(matter.matterId, 'Klien melanjutkan berkas', 'REQ_T');
    assertEqual(restored.matterStatus, CONFIG.MATTER_STATUS.ACTIVE, 'Restored matter must be ACTIVE again');

    // Test Archive Matter
    var archived = MatterService.archiveMatter(matter.matterId, 'Arsip berkas', 'REQ_T');
    assertEqual(archived.matterStatus, CONFIG.MATTER_STATUS.ARCHIVED, 'Archived matter status must be ARCHIVED');
  }

  function testWorkflowEngine() {
    setupTestEnvironment();
    var owner = { userId: 'USR_OWNER_TEST', email: 'owner.test@kantornotaris.com', name: 'Owner Test', role: CONFIG.ROLES.OWNER, status: CONFIG.USER_STATUS.ACTIVE };
    Auth.setMockUser(owner);

    var client = ClientService.createClient({ name: 'Citra Dewi', phone: '08111222333' }, 'REQ_T');
    var matter = MatterService.createMatter({
      clientId: client.clientId,
      serviceTypeId: 'ST_AJB',
      title: 'AJB Kavling Citra'
    }, 'REQ_T');

    // Step 1: INCOMING -> DOCUMENT_CHECKING (Valid)
    var step2 = WorkflowService.transitionWorkflow(matter.matterId, 'DOCUMENT_CHECKING', 'Mulai periksa berkas', false, '', 'REQ_T');
    assertEqual(step2.currentWorkflowStep, 'DOCUMENT_CHECKING', 'Workflow transition to DOCUMENT_CHECKING must succeed');

    // Step 2: DOCUMENT_CHECKING -> COMPLETED (Invalid without override)
    var invalidBlocked = false;
    try {
      WorkflowService.transitionWorkflow(matter.matterId, 'COMPLETED', 'Langsung loncat selesai', false, '', 'REQ_T');
    } catch (e) {
      invalidBlocked = true;
    }
    assert(invalidBlocked, 'Arbitrary forward transition must be rejected by workflow validator');

    // Step 3: Owner override transition with reason
    var overrideStep = WorkflowService.transitionWorkflow(matter.matterId, 'COMPLETED', 'Penyelesaian khusus', true, 'Dispensasi Notaris', 'REQ_T');
    assertEqual(overrideStep.currentWorkflowStep, 'COMPLETED', 'Owner override transition must succeed');
    assertEqual(overrideStep.matterStatus, CONFIG.MATTER_STATUS.COMPLETED, 'Transition to COMPLETED must set matterStatus to COMPLETED');

    // Check history log
    var history = Repository.WorkflowHistory.find({ matterId: matter.matterId });
    assert(history.length >= 3, 'WorkflowHistory must contain initial creation and subsequent transitions');
  }

  function testTaskManagement() {
    setupTestEnvironment();
    var owner = { userId: 'USR_OWNER_TEST', email: 'owner.test@kantornotaris.com', name: 'Owner Test', role: CONFIG.ROLES.OWNER, status: CONFIG.USER_STATUS.ACTIVE };
    var staff = { userId: 'USR_STAFF_1', email: 'staff1@kantornotaris.com', name: 'Staff Satu', role: CONFIG.ROLES.STAFF, status: CONFIG.USER_STATUS.ACTIVE };
    
    Auth.setMockUser(owner);
    var client = ClientService.createClient({ name: 'Doni Kusuma', phone: '081234' }, 'REQ_T');
    var matter = MatterService.createMatter({ clientId: client.clientId, serviceTypeId: 'ST_AJB', title: 'Perkara Doni' }, 'REQ_T');

    var task = TaskService.createTask({
      matterId: matter.matterId,
      title: 'Periksa Warkah Pertanahan',
      assignedTo: staff.email,
      priority: CONFIG.TASK_PRIORITY.HIGH,
      deadline: '2026-08-30'
    }, 'REQ_T');

    assert(task.taskId && task.taskNumber, 'Task must have ID and Number');
    assertEqual(task.status, CONFIG.TASK_STATUS.TODO, 'Initial task status must be TODO');

    Auth.setMockUser(staff);
    var completed = TaskService.completeTask(task.taskId, 'Selesai diverifikasi', 'REQ_T');
    assertEqual(completed.status, CONFIG.TASK_STATUS.DONE, 'Completed task status must be DONE');
    assertEqual(completed.progress, 100, 'Completed task progress must be 100');
    assertEqual(completed.completedBy, staff.email, 'completedBy must record actor email');
  }

  function testPendingControl() {
    setupTestEnvironment();
    var owner = { userId: 'USR_OWNER_TEST', email: 'owner.test@kantornotaris.com', name: 'Owner Test', role: CONFIG.ROLES.OWNER, status: CONFIG.USER_STATUS.ACTIVE };
    Auth.setMockUser(owner);

    var client = ClientService.createClient({ name: 'Eka Rahma', phone: '081234' }, 'REQ_T');
    var matter = MatterService.createMatter({ clientId: client.clientId, serviceTypeId: 'ST_AJB', title: 'Perkara Eka' }, 'REQ_T');

    var pending = PendingService.setMatterPending({
      matterId: matter.matterId,
      reasonCode: 'BPN',
      reasonDetail: 'Pengecekan plot sertifikat',
      pendingSince: '2026-08-20',
      PIC: owner.email
    }, 'REQ_T');

    assert(pending.pendingId, 'Pending record must be created');
    var updatedMatter = Repository.Matters.getById(matter.matterId);
    assertEqual(updatedMatter.matterStatus, CONFIG.MATTER_STATUS.PENDING, 'Matter status must be PENDING');

    var resolved = PendingService.resolvePending(pending.pendingId, 'Plot BPN selesai', 'REQ_T');
    assertEqual(resolved.status, 'RESOLVED', 'Pending status must be RESOLVED');

    var postResolvedMatter = Repository.Matters.getById(matter.matterId);
    assertEqual(postResolvedMatter.matterStatus, CONFIG.MATTER_STATUS.ACTIVE, 'Matter status must return to ACTIVE after pending resolved');
  }

  function testChecklistCompleteness() {
    setupTestEnvironment();
    var owner = { userId: 'USR_OWNER_TEST', email: 'owner.test@kantornotaris.com', name: 'Owner Test', role: CONFIG.ROLES.OWNER, status: CONFIG.USER_STATUS.ACTIVE };
    var staff = { userId: 'USR_STAFF_1', email: 'staff1@kantornotaris.com', name: 'Staff Satu', role: CONFIG.ROLES.STAFF, status: CONFIG.USER_STATUS.ACTIVE };
    
    Auth.setMockUser(owner);
    var client = ClientService.createClient({ name: 'Ferry Kurniawan', phone: '081234' }, 'REQ_T');
    var matter = MatterService.createMatter({ clientId: client.clientId, serviceTypeId: 'ST_AJB', title: 'Perkara Ferry' }, 'REQ_T');

    var items = Repository.ChecklistItems.find({ matterId: matter.matterId });
    assert(items.length > 0, 'Checklist items must be auto-initialized for matter');

    var initialStats = ChecklistService.calculateCompleteness(matter.matterId);
    assertEqual(initialStats.verifiedCount, 0, 'Initially 0 items verified');

    // Verify first item as staff
    Auth.setMockUser(staff);
    ChecklistService.updateChecklistItem(items[0].checklistItemId, CONFIG.CHECKLIST_STATUS.VERIFIED, 'KTP Valid', 'FILE_1', 'http://drive/1', 'REQ_T');
    var updatedStats = ChecklistService.calculateCompleteness(matter.matterId);
    assertEqual(updatedStats.verifiedCount, 1, 'Verified count must increment to 1');
    assert(updatedStats.percentage > 0, 'Completeness percentage must be positive');

    // Test Document Request Text generator
    var reqText = ChecklistService.generateDocumentRequestText(matter.matterId);
    assert(reqText.indexOf('PERMOHONAN KELENGKAPAN DOKUMEN') !== -1, 'Document request text must contain official header');
  }

  function testFinancialEngine() {
    setupTestEnvironment();
    var owner = { userId: 'USR_OWNER_TEST', email: 'owner.test@kantornotaris.com', name: 'Owner Test', role: CONFIG.ROLES.OWNER, status: CONFIG.USER_STATUS.ACTIVE };
    var fin = { userId: 'USR_FIN', email: 'finance@kantornotaris.com', name: 'Finance Staff', role: CONFIG.ROLES.FINANCE, status: CONFIG.USER_STATUS.ACTIVE };
    
    Auth.setMockUser(owner);
    var client = ClientService.createClient({ name: 'Gita Gutawa', phone: '081234' }, 'REQ_T');
    var matter = MatterService.createMatter({ clientId: client.clientId, serviceTypeId: 'ST_AJB', title: 'Perkara Gita' }, 'REQ_T');

    Auth.setMockUser(fin);
    var invoice = BillingService.createInvoice({
      matterId: matter.matterId,
      clientId: client.clientId,
      invoiceDate: '2026-08-26',
      dueDate: '2026-09-10',
      items: [
        { description: 'Jasa Pembuatan Akta AJB', amount: 3000000 },
        { description: 'Validasi Pajak PPh & BPHTB', amount: 1000000 }
      ],
      discount: 500000,
      tax: 0
    }, 'REQ_T');

    assertEqual(invoice.subtotal, 4000000, 'Subtotal calculation mismatch');
    assertEqual(invoice.total, 3500000, 'Total calculation mismatch (4.000.000 - 500.000)');
    assertEqual(invoice.outstanding, 3500000, 'Initial outstanding must equal total');
    assertEqual(invoice.status, CONFIG.INVOICE_STATUS.ISSUED, 'Initial status must be ISSUED');

    // Partial Payment: 2.000.000
    var pay1 = BillingService.recordPayment({
      invoiceId: invoice.invoiceId,
      amount: 2000000,
      paymentDate: '2026-08-26',
      method: 'TRANSFER_BANK'
    }, 'REQ_T');

    assertEqual(pay1.invoiceStatus, CONFIG.INVOICE_STATUS.PARTIAL, 'Status must be PARTIAL after partial payment');
    assertEqual(pay1.outstanding, 1500000, 'Outstanding balance must be 1.500.000');

    // Full Payment remainder: 1.500.000
    var pay2 = BillingService.recordPayment({
      invoiceId: invoice.invoiceId,
      amount: 1500000,
      paymentDate: '2026-08-26',
      method: 'TRANSFER_BANK'
    }, 'REQ_T');

    assertEqual(pay2.invoiceStatus, CONFIG.INVOICE_STATUS.PAID, 'Status must be PAID when fully paid');
    assertEqual(pay2.outstanding, 0, 'Outstanding must be 0 when fully paid');
    assert(pay2.payment.receiptNumber, 'Receipt number must be generated');
  }

  function testNotificationDeduplication() {
    setupTestEnvironment();
    var data = {
      recipientEmail: 'client.test@gmail.com',
      type: 'TASK_OVERDUE',
      entityType: 'TASK',
      entityId: 'TSK_123',
      subject: 'Tugas Terlewat'
    };

    var notif1 = NotificationService.queueNotification(data);
    assert(notif1 && notif1.notificationId, 'First notification must be queued');

    // Queue second identical notification on same day
    var notif2 = NotificationService.queueNotification(data);
    assertEqual(notif1.notificationId, notif2.notificationId, 'Duplicate notification must return existing queued item (Deduplication)');
  }

  function testSigningReadiness() {
    setupTestEnvironment();
    var owner = { userId: 'USR_OWNER_TEST', email: 'owner.test@kantornotaris.com', name: 'Owner Test', role: CONFIG.ROLES.OWNER, status: CONFIG.USER_STATUS.ACTIVE };
    Auth.setMockUser(owner);

    var client = ClientService.createClient({ name: 'Hadi Pranoto', phone: '081234' }, 'REQ_T');
    var matter = MatterService.createMatter({ clientId: client.clientId, serviceTypeId: 'ST_AJB', title: 'Perkara Hadi' }, 'REQ_T');

    var signing = SigningService.scheduleSigning({
      matterId: matter.matterId,
      date: '2026-08-28',
      startTime: '10:00',
      participants: 'Penjual & Pembeli'
    }, 'REQ_T');

    var readiness = SigningService.evaluateReadiness(signing.signingId);
    assertEqual(readiness.isReady, false, 'Signing must be NOT_READY when documents are unverified and draft not approved');
    assert(readiness.blockers.length > 0, 'Blockers list must describe reasons');
  }

  function testStaffHandover() {
    setupTestEnvironment();
    var owner = { userId: 'USR_OWNER_TEST', email: 'owner.test@kantornotaris.com', name: 'Owner Test', role: CONFIG.ROLES.OWNER, status: CONFIG.USER_STATUS.ACTIVE };
    Auth.setMockUser(owner);

    var staff1 = UserService.createUser({ email: 'staff.lama@kantornotaris.com', name: 'Staf Lama', role: CONFIG.ROLES.STAFF }, 'REQ_T');
    var staff2 = UserService.createUser({ email: 'staff.baru@kantornotaris.com', name: 'Staf Baru', role: CONFIG.ROLES.STAFF }, 'REQ_T');

    var client = ClientService.createClient({ name: 'Klien Handover', phone: '081234' }, 'REQ_T');
    var matter = MatterService.createMatter({ clientId: client.clientId, serviceTypeId: 'ST_AJB', title: 'Perkara Handover', assignedPIC: staff1.email }, 'REQ_T');
    TaskService.createTask({ matterId: matter.matterId, title: 'Task Handover', assignedTo: staff1.email }, 'REQ_T');

    var handoverResult = UserService.handoverResponsibilities(staff1.email, staff2.email, 'REQ_T');
    assert(handoverResult.success, 'Handover must succeed');
    assertEqual(handoverResult.transferred.matters, 1, '1 matter must be transferred');
    assertEqual(handoverResult.transferred.tasks, 1, '1 task must be transferred');

    var updatedMat = Repository.Matters.getById(matter.matterId);
    assertEqual(updatedMat.assignedPIC, staff2.email, 'Matter assignedPIC must be updated to new staff');
  }

  function testAuditTrail() {
    setupTestEnvironment();
    var owner = { userId: 'USR_OWNER_TEST', email: 'owner.test@kantornotaris.com', name: 'Owner Test', role: CONFIG.ROLES.OWNER, status: CONFIG.USER_STATUS.ACTIVE };
    Auth.setMockUser(owner);

    var logEntry = AuditService.log({
      actorUserId: owner.userId,
      actorEmail: owner.email,
      action: 'SECURITY_TEST_AUDIT',
      entityType: 'TEST',
      entityId: 'TEST_1',
      description: 'Verifikasi integritas audit trail'
    });

    assert(logEntry && logEntry.logId, 'Audit log entry must be created with unique ID');
    assert(logEntry.timestamp, 'Audit log must record timestamp');

    var allLogs = AuditService.getLogs({ action: 'SECURITY_TEST_AUDIT' });
    assert(allLogs.total >= 1, 'Audit log query must find the inserted log entry');
  }

  function testHealthCheck() {
    setupTestEnvironment();
    var health = HealthService.runHealthCheck();
    assert(health.status === 'HEALTHY' || health.status === 'WARNING', 'Health check status must be HEALTHY or WARNING in test mode');
    assert(health.checks.length >= 5, 'Health check must perform multiple subsystem evaluations');
  }

  function testCredentialLoginAndAdminReset() {
    setupTestEnvironment();
    var owner = { userId: 'USR_OWNER_TEST', email: 'owner.test@kantornotaris.com', name: 'Owner Test', role: CONFIG.ROLES.OWNER, status: CONFIG.USER_STATUS.ACTIVE };
    Auth.setMockUser(owner);

    // 1. Super Admin creates a new staff with initial password
    var newStaff = UserService.createUser({
      email: 'staff.auth.test@kantornotaris.com',
      name: 'Staff Auth Test',
      role: CONFIG.ROLES.STAFF,
      password: 'MySecretPassword123!'
    }, 'REQ_T');

    assert(newStaff.userId, 'User must be created with userId');
    assertEqual(newStaff.email, 'staff.auth.test@kantornotaris.com', 'User email must match');

    // 2. Test successful credential login
    var loggedIn = Auth.login('staff.auth.test@kantornotaris.com', 'MySecretPassword123!', 'REQ_T');
    assertEqual(loggedIn.userId, newStaff.userId, 'Login must return correct user');
    assertEqual(loggedIn.hasPassword, true, 'User must have password set');
    assert(loggedIn.lastLoginAt, 'lastLoginAt must be updated on login');

    // 3. Test failed login with wrong password
    var wrongPassBlocked = false;
    try {
      Auth.login('staff.auth.test@kantornotaris.com', 'WrongPassword!', 'REQ_T');
    } catch (e) {
      wrongPassBlocked = true;
    }
    assert(wrongPassBlocked, 'Login with wrong password must throw error');

    // 4. Test Super Admin resets staff password
    Auth.setMockUser(owner);
    var resetResult = UserService.resetUserPassword(newStaff.userId, 'AdminResetPass789!', 'REQ_T');
    assert(resetResult.success, 'Super Admin password reset must succeed');

    // 5. Verify staff can log in with newly reset password
    var postResetLogin = Auth.login('staff.auth.test@kantornotaris.com', 'AdminResetPass789!', 'REQ_T');
    assertEqual(postResetLogin.userId, newStaff.userId, 'Staff must log in with reset password');

    // 6. Test self password change
    Auth.setMockUser({ userId: newStaff.userId, email: newStaff.email, role: CONFIG.ROLES.STAFF, status: CONFIG.USER_STATUS.ACTIVE });
    var changeResult = UserService.changePassword(newStaff.userId, 'AdminResetPass789!', 'UserSelfNewPass456!', 'REQ_T');
    assert(changeResult.success, 'Self password change must succeed');

    // 7. Verify login with self-changed password
    var postChangeLogin = Auth.login('staff.auth.test@kantornotaris.com', 'UserSelfNewPass456!', 'REQ_T');
    assertEqual(postChangeLogin.userId, newStaff.userId, 'Staff must log in with self-changed password');

    // 8. Test deactivated user login rejection
    Auth.setMockUser(owner);
    UserService.deactivateUser(newStaff.userId, 'REQ_T');
    var deactBlocked = false;
    try {
      Auth.login('staff.auth.test@kantornotaris.com', 'UserSelfNewPass456!', 'REQ_T');
    } catch (e) {
      deactBlocked = true;
    }
    assert(deactBlocked, 'Deactivated user login must be rejected');
  }

  return {
    runAllTests: runAllTests
  };
})();
