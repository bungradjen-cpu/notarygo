/**
 * NOTARYGO™ — Notary Office Operational Control System
 * Idempotent Bootstrap, System Setup & Safe Demo Data Seeder
 */

var Bootstrap = (function() {
  /**
   * Initializes NOTARYGO™ from scratch (Idempotent)
   */
  function initializeNotaryGo(ownerEmail, ownerName) {
    return Database.withLock(45000, function() {
      // 1. Setup Database & Sheets
      var dbResult = Database.setupDatabase();

      // 2. Setup Google Drive
      var driveResult = {};
      try {
        driveResult = DriveService.setupDriveStructure();
      } catch (e) {}

      // 3. Resolve Owner Identity
      var resolvedEmail = ownerEmail || Auth.getActiveEmail() || 'notaris@kantornotaris.com';
      var resolvedName = ownerName || 'Nama Notaris, S.H., M.Kn.';

      var existingOwner = Repository.Users.findOne(function(u) {
        return u.role === CONFIG.ROLES.OWNER && u.status === CONFIG.USER_STATUS.ACTIVE;
      });

      if (!existingOwner) {
        var ownerSalt = Utils.generateSalt();
        var ownerHash = Utils.hashPassword('NotaryGo123!', ownerSalt);
        var ownerUser = {
          userId: Utils.generateId(CONFIG.PREFIX.USER),
          email: resolvedEmail.toLowerCase().trim(),
          name: resolvedName,
          role: CONFIG.ROLES.OWNER,
          phone: '081234567890',
          status: CONFIG.USER_STATUS.ACTIVE,
          passwordHash: ownerHash,
          passwordSalt: ownerSalt,
          lastLoginAt: '',
          notificationPreferences: Utils.safeJsonStringify({
            taskAssigned: true,
            deadlineH7: true,
            deadlineH3: true,
            deadlineH1: true,
            overdue: true,
            signing: true,
            dailySummary: true
          }),
          createdAt: Utils.nowIso(),
          createdBy: 'SYSTEM_BOOTSTRAP',
          updatedAt: Utils.nowIso(),
          updatedBy: 'SYSTEM_BOOTSTRAP'
        };
        Repository.Users.insert(ownerUser);
        PropertiesService.getScriptProperties().setProperty(CONFIG.KEYS.OWNER_EMAIL, ownerUser.email);
      }

      // 4. Initialize Office Profile
      var existingProfile = Repository.Office.getProfile();
      if (!existingProfile) {
        Repository.Office.saveProfile({
          officeId: Utils.generateId('OFF_'),
          officeName: 'Kantor Notaris & PPAT ' + resolvedName,
          notaryName: resolvedName,
          notaryTitle: 'Notaris & Pejabat Pembuat Akta Tanah (PPAT)',
          address: 'Jl. Sudirman No. 123',
          city: 'Jakarta Selatan',
          province: 'DKI Jakarta',
          postalCode: '12190',
          phone: '021-5550199',
          whatsapp: '081234567890',
          email: resolvedEmail,
          website: 'https://kantornotaris.com',
          logoFileId: '',
          footerText: 'Dokumen ini diterbitkan secara sah oleh Kantor Notaris & PPAT melalui NOTARYGO™.',
          bankName: 'Bank Central Asia (BCA)',
          bankAccount: '1234567890',
          bankAccountName: 'Kantor Notaris ' + resolvedName,
          invoicePrefix: 'INV/NG',
          matterPrefix: 'NG',
          timezone: CONFIG.TIMEZONE
        }, 'SYSTEM_BOOTSTRAP');
      }

      // 5. Initialize Standard Service Types
      initDefaultServiceTypes();

      // 6. Initialize Default Workflow Templates & Steps
      initDefaultWorkflows();

      // 7. Setup Triggers (if in real GAS environment)
      try {
        setupTriggers();
      } catch (e) {}

      PropertiesService.getScriptProperties().setProperty(CONFIG.KEYS.SYSTEM_INITIALIZED, 'true');

      return {
        success: true,
        message: 'Inisialisasi NOTARYGO™ berhasil diselesaikan.',
        database: dbResult,
        drive: driveResult,
        ownerEmail: resolvedEmail
      };
    });
  }

  /**
   * Initializes standard Indonesian Notary & PPAT service types
   */
  function initDefaultServiceTypes() {
    var defaultServices = [
      { id: 'ST_AJB', code: 'AJB', name: 'Akta Jual Beli (AJB)', cat: 'PPAT', sla: 14, fee: 3500000 },
      { id: 'ST_PPJB', code: 'PPJB', name: 'Perjanjian Pengikatan Jual Beli (PPJB)', cat: 'NOTARIS', sla: 7, fee: 2500000 },
      { id: 'ST_APHT', code: 'APHT', name: 'Akta Pemberian Hak Tanggungan (APHT)', cat: 'PPAT', sla: 10, fee: 3000000 },
      { id: 'ST_SKMHT', code: 'SKMHT', name: 'Surat Kuasa Membebankan Hak Tanggungan (SKMHT)', cat: 'PPAT', sla: 5, fee: 1500000 },
      { id: 'ST_ROYA', code: 'ROYA', name: 'Roya / Pencoretan Hak Tanggungan', cat: 'PPAT', sla: 7, fee: 1000000 },
      { id: 'ST_BALIK_NAMA', code: 'BALIK_NAMA', name: 'Balik Nama Sertifikat', cat: 'PPAT', sla: 21, fee: 2000000 },
      { id: 'ST_HIBAH', code: 'HIBAH', name: 'Akta Hibah', cat: 'PPAT', sla: 14, fee: 3000000 },
      { id: 'ST_WARIS', code: 'WARIS', name: 'Keterangan Waris / Akta Pembagian Hak Bersama (APHB)', cat: 'PPAT', sla: 14, fee: 3500000 },
      { id: 'ST_PENDIRIAN_PT', code: 'PENDIRIAN_PT', name: 'Pendirian PT / Badan Usaha', cat: 'NOTARIS', sla: 10, fee: 5000000 },
      { id: 'ST_PERUBAHAN_PT', code: 'PERUBAHAN_PT', name: 'Perubahan Anggaran Dasar PT', cat: 'NOTARIS', sla: 7, fee: 3500000 },
      { id: 'ST_LEGALISASI', code: 'LEGALISASI', name: 'Legalisasi Surat / Dokumen Bawah Tangan', cat: 'NOTARIS', sla: 1, fee: 250000 },
      { id: 'ST_WAARMERKING', code: 'WAARMERKING', name: 'Waarmerking / Pendaftaran Surat', cat: 'NOTARIS', sla: 1, fee: 200000 },
      { id: 'ST_OTHER', code: 'OTHER', name: 'Layanan Hukum Lainnya', cat: 'GENERAL', sla: 14, fee: 2000000 }
    ];

    for (var i = 0; i < defaultServices.length; i++) {
      var s = defaultServices[i];
      var existing = Repository.ServiceTypes.getById(s.id);
      if (!existing) {
        Repository.ServiceTypes.insert({
          serviceTypeId: s.id,
          code: s.code,
          name: s.name,
          category: s.cat,
          description: 'Layanan standar ' + s.name,
          defaultWorkflowId: 'WF_DEFAULT',
          defaultChecklistTemplateId: 'CKT_' + s.code,
          defaultSlaDays: s.sla,
          standardFee: s.fee,
          active: true,
          createdAt: Utils.nowIso(),
          updatedAt: Utils.nowIso()
        });
      }
    }
  }

  /**
   * Initializes default workflow templates and sequential steps
   */
  function initDefaultWorkflows() {
    var existingWf = Repository.WorkflowTemplates.getById('WF_DEFAULT');
    if (!existingWf) {
      Repository.WorkflowTemplates.insert({
        workflowId: 'WF_DEFAULT',
        name: 'Alur Kerja Standar Notaris & PPAT',
        serviceTypeId: 'ALL',
        version: '1.0',
        description: 'Standard 10-step legal workflow pipeline',
        active: true,
        createdAt: Utils.nowIso(),
        createdBy: 'SYSTEM_BOOTSTRAP',
        updatedAt: Utils.nowIso()
      });
    }

    var defaultSteps = [
      { order: 1, code: 'INCOMING', name: 'Penerimaan Berkas', role: 'ADMIN', sla: 1, approval: false, next: 'DOCUMENT_CHECKING' },
      { order: 2, code: 'DOCUMENT_CHECKING', name: 'Pemeriksaan Dokumen', role: 'STAFF', sla: 2, approval: false, next: 'WAITING_DOCUMENT,DRAFTING' },
      { order: 3, code: 'WAITING_DOCUMENT', name: 'Menunggu Dokumen Klien', role: 'STAFF', sla: 5, approval: false, next: 'DOCUMENT_CHECKING,DRAFTING' },
      { order: 4, code: 'DRAFTING', name: 'Pembuatan Draft Akta', role: 'STAFF', sla: 3, approval: false, next: 'INTERNAL_REVIEW' },
      { order: 5, code: 'INTERNAL_REVIEW', name: 'Review Internal Supervisor', role: 'SUPERVISOR', sla: 2, approval: true, next: 'NOTARY_APPROVAL,DRAFTING' },
      { order: 6, code: 'NOTARY_APPROVAL', name: 'Persetujuan Notaris', role: 'OWNER', sla: 1, approval: true, next: 'CLIENT_APPROVAL,DRAFTING' },
      { order: 7, code: 'CLIENT_APPROVAL', name: 'Persetujuan Klien', role: 'STAFF', sla: 2, approval: false, next: 'SIGNING,DRAFTING' },
      { order: 8, code: 'SIGNING', name: 'Penandatanganan Akta', role: 'STAFF', sla: 1, approval: false, next: 'PROCESSING' },
      { order: 9, code: 'PROCESSING', name: 'Proses Pendaftaran (BPN/Pajak/AHU)', role: 'STAFF', sla: 14, approval: false, next: 'COMPLETED' },
      { order: 10, code: 'COMPLETED', name: 'Perkara Selesai & Penyerahan', role: 'ADMIN', sla: 1, approval: false, next: 'ARCHIVED' }
    ];

    for (var j = 0; j < defaultSteps.length; j++) {
      var step = defaultSteps[j];
      var stepId = 'STP_DEFAULT_' + step.order;
      var existingStep = Repository.WorkflowSteps.getById(stepId);
      if (!existingStep) {
        Repository.WorkflowSteps.insert({
          stepId: stepId,
          workflowId: 'WF_DEFAULT',
          stepOrder: step.order,
          stepCode: step.code,
          stepName: step.name,
          defaultPICRole: step.role,
          defaultDeadlineDays: step.sla,
          approvalRequired: step.approval,
          sopReference: 'SOP-' + step.code,
          nextStepCode: step.next,
          status: 'ACTIVE'
        });
      }
    }
  }

  /**
   * Sets up installable time-driven triggers idempotently
   */
  function setupTriggers() {
    if (Database.isMockMode() || typeof ScriptApp === 'undefined' || !ScriptApp.getProjectTriggers) {
      return { success: true, mock: true };
    }

    var existingTriggers = ScriptApp.getProjectTriggers();
    for (var i = 0; i < existingTriggers.length; i++) {
      ScriptApp.deleteTrigger(existingTriggers[i]);
    }

    // 1. Notification processor every 15 minutes
    ScriptApp.newTrigger('processNotificationQueueTrigger')
      .timeBased()
      .everyMinutes(15)
      .create();

    // 2. Owner Daily Brief at 07:30 WIB
    ScriptApp.newTrigger('sendDailyBriefTrigger')
      .timeBased()
      .atHour(7)
      .nearMinute(30)
      .everyDays(1)
      .inTimezone(CONFIG.TIMEZONE)
      .create();

    // 3. Daily Backup at 23:00 WIB
    ScriptApp.newTrigger('runDailyBackupTrigger')
      .timeBased()
      .atHour(23)
      .everyDays(1)
      .inTimezone(CONFIG.TIMEZONE)
      .create();

    return {
      success: true,
      message: 'Installable triggers berhasil diatur secara idempotensial.'
    };
  }

  /**
   * Seeds rich test demo data for DEV or TEST environment (Guarded against PRODUCTION)
   */
  function seedDemoData() {
    var env = PropertiesService.getScriptProperties().getProperty(CONFIG.KEYS.ENVIRONMENT) || CONFIG.ENV_DEV;
    if (env === CONFIG.ENV_PROD) {
      throw new Error('DILARANG: Tidak diperbolehkan melakukan seeding demo data di lingkungan PRODUCTION!');
    }

    return Database.withLock(45000, function() {
      // Setup base schema & office
      initializeNotaryGo('notaris.utama@kantornotaris.com', 'Hj. Siti Rahmawati, S.H., M.Kn.');

      // 1. Users
      var demoUsers = [
        { id: 'USR_OWNER', email: 'notaris.utama@kantornotaris.com', name: 'Hj. Siti Rahmawati, S.H., M.Kn.', role: CONFIG.ROLES.OWNER, phone: '08111222333' },
        { id: 'USR_ADMIN', email: 'admin.kantor@kantornotaris.com', name: 'Budi Santoso (Admin)', role: CONFIG.ROLES.ADMIN, phone: '08123456701' },
        { id: 'USR_SPV', email: 'spv.hukum@kantornotaris.com', name: 'Ahmad Fauzi, S.H. (Supervisor)', role: CONFIG.ROLES.SUPERVISOR, phone: '08123456702' },
        { id: 'USR_STAFF1', email: 'rina.staff@kantornotaris.com', name: 'Rina Astuti (Staff PPAT)', role: CONFIG.ROLES.STAFF, phone: '08123456703' },
        { id: 'USR_STAFF2', email: 'dimas.staff@kantornotaris.com', name: 'Dimas Prasetyo (Staff Notaris)', role: CONFIG.ROLES.STAFF, phone: '08123456704' },
        { id: 'USR_STAFF3', email: 'maya.staff@kantornotaris.com', name: 'Maya Sari (Staff Lapangan & BPN)', role: CONFIG.ROLES.STAFF, phone: '08123456705' },
        { id: 'USR_FIN', email: 'finance.office@kantornotaris.com', name: 'Dewi Lestari (Finance/Kasir)', role: CONFIG.ROLES.FINANCE, phone: '08123456706' }
      ];

      for (var u = 0; u < demoUsers.length; u++) {
        var du = demoUsers[u];
        if (!Repository.Users.getById(du.id)) {
          Repository.Users.insert({
            userId: du.id,
            email: du.email,
            name: du.name,
            role: du.role,
            phone: du.phone,
            status: CONFIG.USER_STATUS.ACTIVE,
            notificationPreferences: '{}',
            createdAt: Utils.nowIso(),
            createdBy: 'SEEDER',
            updatedAt: Utils.nowIso(),
            updatedBy: 'SEEDER'
          });
        }
      }

      // 2. Organizations
      var demoOrgs = [
        { id: 'ORG_MANDIRI', name: 'PT Bank Mandiri (Persero) Tbk - KCP Sudirman', type: 'BANK', contactPerson: 'Hendra Gunawan', phone: '021-5299000', email: 'kredit.mandiri@bankmandiri.co.id' },
        { id: 'ORG_BCA', name: 'PT Bank Central Asia Tbk - KCU Thamrin', type: 'BANK', contactPerson: 'Linda Wijaya', phone: '021-2358800', email: 'kpr.bca@bca.co.id' },
        { id: 'ORG_CIPUTRA', name: 'PT Ciputra Development Tbk', type: 'DEVELOPER', contactPerson: 'Bambang Soediro', phone: '021-5678900', email: 'legal@ciputra.com' },
        { id: 'ORG_SINARMAS', name: 'Sinarmas Land Group', type: 'DEVELOPER', contactPerson: 'Eko Prasetyo', phone: '021-5036888', email: 'legal@sinarmasland.com' },
        { id: 'ORG_CORP1', name: 'PT Surya Mahakarya Nusantara', type: 'CORPORATE', contactPerson: 'Irfan Bachdim', phone: '021-7890123', email: 'corp.sec@suryamaha.co.id' }
      ];

      for (var o = 0; o < demoOrgs.length; o++) {
        var doOrg = demoOrgs[o];
        if (!Repository.Organizations.getById(doOrg.id)) {
          Repository.Organizations.insert({
            organizationId: doOrg.id,
            name: doOrg.name,
            type: doOrg.type,
            contactPerson: doOrg.contactPerson,
            phone: doOrg.phone,
            email: doOrg.email,
            address: 'Jakarta, Indonesia',
            notes: 'Mitra rekanan utama',
            status: 'ACTIVE',
            createdAt: Utils.nowIso(),
            createdBy: 'SEEDER',
            updatedAt: Utils.nowIso(),
            updatedBy: 'SEEDER'
          });
        }
      }

      // 3. Clients (20 Clients)
      var clientNames = [
        'Agus Setiawan', 'Bambang Pamungkas', 'Citra Dewi', 'Doni Kusuma', 'Eka Rahmawati',
        'Ferry Kurniawan', 'Gita Gutawa', 'Hadi Pranoto', 'Indah Permatasari', 'Joko Widodo',
        'Kartika Putri', 'Lukman Sardi', 'Mega Suryani', 'Nadia Hutagalung', 'Oki Setiana',
        'Pratama Arhan', 'Rina Nose', 'Sandiaga Uno', 'Taufik Hidayat', 'Vina Panduwinata'
      ];

      var createdClientIds = [];
      for (var c = 0; c < clientNames.length; c++) {
        var cId = 'CLI_' + ('00' + (c + 1)).slice(-3);
        createdClientIds.push(cId);
        if (!Repository.Clients.getById(cId)) {
          Repository.Clients.insert({
            clientId: cId,
            clientType: 'INDIVIDU',
            name: clientNames[c],
            identifier: '31710' + (10000000000 + c),
            phone: '081298765' + ('00' + (c + 1)).slice(-3),
            email: clientNames[c].toLowerCase().replace(/ /g, '.') + '@gmail.com',
            address: 'Jl. Mawar No. ' + (c + 10) + ', Jakarta',
            company: c % 3 === 0 ? 'PT Inovasi Mandiri' : '',
            notes: 'Klien aktif',
            status: 'ACTIVE',
            createdAt: Utils.nowIso(),
            createdBy: 'SEEDER',
            updatedAt: Utils.nowIso(),
            updatedBy: 'SEEDER'
          });
        }
      }

      // 4. Matters (30 Matters with diverse statuses)
      var matterTemplates = [
        { title: 'AJB Rumah Tinggal Kebayoran Baru', serviceId: 'ST_AJB', orgId: 'ORG_MANDIRI', pic: 'rina.staff@kantornotaris.com', step: 'PROCESSING', status: CONFIG.MATTER_STATUS.ACTIVE, deadlineDays: 10 },
        { title: 'AJB Ruko Komersial Fatmawati', serviceId: 'ST_AJB', orgId: 'ORG_BCA', pic: 'rina.staff@kantornotaris.com', step: 'SIGNING', status: CONFIG.MATTER_STATUS.ACTIVE, deadlineDays: 1 },
        { title: 'APHT Fasilitas KPR Bank Mandiri', serviceId: 'ST_APHT', orgId: 'ORG_MANDIRI', pic: 'rina.staff@kantornotaris.com', step: 'PROCESSING', status: CONFIG.MATTER_STATUS.ACTIVE, deadlineDays: -2 }, // Overdue
        { title: 'PPJB Apartemen Ciputra World', serviceId: 'ST_PPJB', orgId: 'ORG_CIPUTRA', pic: 'dimas.staff@kantornotaris.com', step: 'INTERNAL_REVIEW', status: CONFIG.MATTER_STATUS.ACTIVE, deadlineDays: 3 },
        { title: 'Pendirian PT Teknologi Nusantara Gemilang', serviceId: 'ST_PENDIRIAN_PT', orgId: 'ORG_CORP1', pic: 'dimas.staff@kantornotaris.com', step: 'DRAFTING', status: CONFIG.MATTER_STATUS.ACTIVE, deadlineDays: 5 },
        { title: 'Perubahan Anggaran Dasar PT Mega Perkasa', serviceId: 'ST_PERUBAHAN_PT', orgId: 'ORG_CORP1', pic: 'dimas.staff@kantornotaris.com', step: 'NOTARY_APPROVAL', status: CONFIG.MATTER_STATUS.WAITING_APPROVAL, deadlineDays: 2 },
        { title: 'Balik Nama Sertifikat Hak Milik No. 1234', serviceId: 'ST_BALIK_NAMA', orgId: '', pic: 'maya.staff@kantornotaris.com', step: 'PROCESSING', status: CONFIG.MATTER_STATUS.PENDING, deadlineDays: 15, pendingReason: 'BPN: Menunggu verifikasi plot warkah di kantor pertanahan' },
        { title: 'Roya Hak Tanggungan Bank BCA', serviceId: 'ST_ROYA', orgId: 'ORG_BCA', pic: 'maya.staff@kantornotaris.com', step: 'PROCESSING', status: CONFIG.MATTER_STATUS.ACTIVE, deadlineDays: 4 },
        { title: 'Akta Pembagian Hak Bersama (APHB) Ahli Waris', serviceId: 'ST_WARIS', orgId: '', pic: 'rina.staff@kantornotaris.com', step: 'WAITING_DOCUMENT', status: CONFIG.MATTER_STATUS.ACTIVE, deadlineDays: 7 },
        { title: 'Akta Hibah Tanah & Bangunan Cilandak', serviceId: 'ST_HIBAH', orgId: '', pic: 'rina.staff@kantornotaris.com', step: 'COMPLETED', status: CONFIG.MATTER_STATUS.COMPLETED, deadlineDays: -30 },
        { title: 'AJB Kavling BSD City Sinarmas', serviceId: 'ST_AJB', orgId: 'ORG_SINARMAS', pic: 'rina.staff@kantornotaris.com', step: 'DOCUMENT_CHECKING', status: CONFIG.MATTER_STATUS.ACTIVE, deadlineDays: 6 },
        { title: 'SKMHT Pinjaman Modal Usaha', serviceId: 'ST_SKMHT', orgId: 'ORG_MANDIRI', pic: 'rina.staff@kantornotaris.com', step: 'SIGNING', status: CONFIG.MATTER_STATUS.ACTIVE, deadlineDays: 0 }, // Today
        { title: 'Legalisasi Surat Perjanjian Kerjasama', serviceId: 'ST_LEGALISASI', orgId: '', pic: 'dimas.staff@kantornotaris.com', step: 'COMPLETED', status: CONFIG.MATTER_STATUS.COMPLETED, deadlineDays: -5 },
        { title: 'Waarmerking Perjanjian Sewa Menyewa', serviceId: 'ST_WAARMERKING', orgId: '', pic: 'dimas.staff@kantornotaris.com', step: 'COMPLETED', status: CONFIG.MATTER_STATUS.COMPLETED, deadlineDays: -10 },
        { title: 'AJB Rumah Grand Galaxy City (Batal Klien)', serviceId: 'ST_AJB', orgId: '', pic: 'rina.staff@kantornotaris.com', step: 'INCOMING', status: CONFIG.MATTER_STATUS.CANCELLED, deadlineDays: -20, cancelReason: 'CLIENT_CANCELLED: Klien membatalkan transaksi karena sengketa waris' },
        { title: 'Perkara Salah Input Data Entry', serviceId: 'ST_OTHER', orgId: '', pic: 'admin.kantor@kantornotaris.com', step: 'INCOMING', status: CONFIG.MATTER_STATUS.ARCHIVED, deadlineDays: -40, archiveReason: 'WRONG_INPUT: Duplikasi penginputan oleh front office' }
      ];

      var today = new Date();

      for (var m = 0; m < matterTemplates.length; m++) {
        var tm = matterTemplates[m];
        var matId = 'MAT_DEMO_' + ('00' + (m + 1)).slice(-3);
        var matNum = 'NG-2026-' + ('00000' + (m + 1)).slice(-6);
        var clientIndex = m % createdClientIds.length;
        var clId = createdClientIds[clientIndex];
        var clName = clientNames[clientIndex];

        var dDate = new Date(today.getTime() + (tm.deadlineDays * 24 * 60 * 60 * 1000));
        var deadlineIso = Utils.todayIsoDate(dDate);

        if (!Repository.Matters.getById(matId)) {
          Repository.Matters.insert({
            matterId: matId,
            matterNumber: matNum,
            clientId: clId,
            clientNameSnapshot: clName,
            serviceTypeId: tm.serviceId,
            serviceTypeNameSnapshot: tm.serviceId.replace('ST_', ''),
            organizationId: tm.orgId,
            title: tm.title,
            description: 'Penanganan perkara ' + tm.title,
            priority: tm.deadlineDays < 0 ? CONFIG.TASK_PRIORITY.CRITICAL : (tm.deadlineDays <= 2 ? CONFIG.TASK_PRIORITY.HIGH : CONFIG.TASK_PRIORITY.MEDIUM),
            assignedPIC: tm.pic,
            supervisor: 'spv.hukum@kantornotaris.com',
            currentWorkflowStep: tm.step,
            matterStatus: tm.status,
            deadline: deadlineIso,
            lastOperationalUpdate: Utils.nowIso(),
            pendingStatus: tm.status === CONFIG.MATTER_STATUS.PENDING ? 'PENDING' : 'NONE',
            pendingReason: tm.pendingReason || '',
            nextAction: 'Lanjutan proses ' + tm.step,
            driveFolderId: 'DRIVE_MATTER_' + matNum,
            financialStatus: tm.status === CONFIG.MATTER_STATUS.COMPLETED ? 'PAID' : 'BILLED',
            isArchived: tm.status === CONFIG.MATTER_STATUS.ARCHIVED,
            createdBy: 'admin.kantor@kantornotaris.com',
            createdAt: Utils.todayIsoDate(new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000))),
            updatedBy: tm.pic,
            updatedAt: Utils.nowIso(),
            completedAt: tm.status === CONFIG.MATTER_STATUS.COMPLETED ? Utils.nowIso() : '',
            cancelledAt: tm.status === CONFIG.MATTER_STATUS.CANCELLED ? Utils.nowIso() : '',
            cancelledBy: tm.status === CONFIG.MATTER_STATUS.CANCELLED ? 'notaris.utama@kantornotaris.com' : '',
            cancellationReason: tm.cancelReason || '',
            archivedAt: tm.status === CONFIG.MATTER_STATUS.ARCHIVED ? Utils.nowIso() : '',
            archivedBy: tm.status === CONFIG.MATTER_STATUS.ARCHIVED ? 'notaris.utama@kantornotaris.com' : '',
            archiveReason: tm.archiveReason || ''
          });

          // Insert Checklist Items
          ChecklistService.initializeChecklistForMatter(matId, tm.serviceId);

          // If Pending, insert active Pending record
          if (tm.status === CONFIG.MATTER_STATUS.PENDING) {
            Repository.Pending.insert({
              pendingId: 'PND_' + matId,
              matterId: matId,
              reasonCode: 'BPN',
              reasonDetail: 'Pengecekan sertifikat dan validasi berkas pertanahan',
              pendingSince: Utils.todayIsoDate(new Date(today.getTime() - (8 * 24 * 60 * 60 * 1000))),
              expectedResumeDate: deadlineIso,
              responsibleParty: 'Kantor Pertanahan (BPN)',
              PIC: tm.pic,
              nextFollowUp: deadlineIso,
              status: 'ACTIVE',
              createdAt: Utils.nowIso(),
              resolvedAt: '',
              resolvedBy: ''
            });
          }

          // Insert Tasks
          var tskId = 'TSK_' + matId;
          Repository.Tasks.insert({
            taskId: tskId,
            matterId: matId,
            taskNumber: 'TSK-2026-' + ('00000' + (m + 1)).slice(-6),
            title: 'Verifikasi berkas & draft ' + tm.title,
            description: 'Lakukan pemeriksaan kelengkapan berkas fisik dan siapkan draft.',
            assignedTo: tm.pic,
            assignedBy: 'spv.hukum@kantornotaris.com',
            priority: tm.deadlineDays <= 2 ? CONFIG.TASK_PRIORITY.HIGH : CONFIG.TASK_PRIORITY.MEDIUM,
            startDate: Utils.todayIsoDate(),
            deadline: deadlineIso,
            status: tm.status === CONFIG.MATTER_STATUS.COMPLETED ? CONFIG.TASK_STATUS.DONE : CONFIG.TASK_STATUS.IN_PROGRESS,
            progress: tm.status === CONFIG.MATTER_STATUS.COMPLETED ? 100 : 50,
            notes: 'Koordinasikan segera dengan klien',
            createdAt: Utils.nowIso(),
            updatedAt: Utils.nowIso(),
            completedAt: tm.status === CONFIG.MATTER_STATUS.COMPLETED ? Utils.nowIso() : '',
            completedBy: tm.status === CONFIG.MATTER_STATUS.COMPLETED ? tm.pic : ''
          });

          // Insert Invoice for active matters
          if (m < 8) {
            var invId = 'INV_DEMO_' + m;
            var invNum = 'INV/NG/2026/' + ('0000' + (m + 1)).slice(-5);
            var isPaid = m % 2 === 0;
            Repository.Invoices.insert({
              invoiceId: invId,
              invoiceNumber: invNum,
              matterId: matId,
              clientId: clId,
              invoiceDate: Utils.todayIsoDate(),
              dueDate: deadlineIso,
              itemsJson: Utils.safeJsonStringify([{ description: 'Biaya Jasa Notaris & PPAT - ' + tm.title, amount: 3500000 }]),
              subtotal: 3500000,
              discount: 0,
              tax: 0,
              total: 3500000,
              paidAmount: isPaid ? 3500000 : 0,
              outstanding: isPaid ? 0 : 3500000,
              status: isPaid ? CONFIG.INVOICE_STATUS.PAID : CONFIG.INVOICE_STATUS.ISSUED,
              notes: 'Tagihan resmi kantor',
              pdfFileId: '',
              createdBy: 'finance.office@kantornotaris.com',
              createdAt: Utils.nowIso(),
              updatedAt: Utils.nowIso()
            });

            if (isPaid) {
              Repository.Payments.insert({
                paymentId: 'PAY_DEMO_' + m,
                invoiceId: invId,
                matterId: matId,
                paymentDate: Utils.todayIsoDate(),
                amount: 3500000,
                method: 'TRANSFER_BANK',
                reference: 'TRX' + (888000 + m),
                receivedBy: 'finance.office@kantornotaris.com',
                receiptNumber: 'RCP/NG/2026/' + ('0000' + (m + 1)).slice(-5),
                notes: 'Pembayaran lunas',
                createdAt: Utils.nowIso(),
                createdBy: 'finance.office@kantornotaris.com'
              });
            }
          }
        }
      }

      AuditService.log({
        actorUserId: 'USR_OWNER',
        actorEmail: 'notaris.utama@kantornotaris.com',
        action: 'SEED_DEMO_DATA',
        entityType: 'SYSTEM',
        entityId: 'DEMO_DATASET',
        description: 'Seeding demo dataset berhasil: 7 users, 5 partner orgs, 20 clients, 16 matters, tasks, invoices.',
        requestId: Utils.generateRequestId()
      });

      return {
        success: true,
        message: 'Seeding demo data DEV/TEST berhasil diselesaikan.'
      };
    });
  }

  return {
    initializeNotaryGo: initializeNotaryGo,
    setupTriggers: setupTriggers,
    seedDemoData: seedDemoData
  };
})();
