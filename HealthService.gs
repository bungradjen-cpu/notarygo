/**
 * NOTARYGO™ — Notary Office Operational Control System
 * System Health Diagnostics & Pre-Flight Check Engine
 */

var HealthService = {
  /**
   * Runs comprehensive health check across all subsystems
   * @return {Object} { status: 'HEALTHY'|'WARNING'|'ERROR', checks: Array, timestamp: string }
   */
  runHealthCheck: function() {
    var checks = [];
    var hasError = false;
    var hasWarning = false;

    function addCheck(component, name, status, message, details) {
      checks.push({
        component: component,
        name: name,
        status: status, // PASS, WARN, FAIL
        message: message,
        details: details || null
      });
      if (status === 'FAIL') hasError = true;
      if (status === 'WARN') hasWarning = true;
    }

    // 1. Database Check
    if (Database.isMockMode()) {
      addCheck('DATABASE', 'Database Mode', 'PASS', 'Berjalan dalam Test / In-Memory Mock Store.');
    } else {
      var ss = Database.getSpreadsheet();
      if (!ss) {
        addCheck('DATABASE', 'Spreadsheet Connection', 'FAIL', 'Database Google Spreadsheet tidak terhubung.');
      } else {
        addCheck('DATABASE', 'Spreadsheet Connection', 'PASS', 'Terhubung ke Google Spreadsheet: ' + ss.getName(), { id: ss.getId(), url: ss.getUrl() });
      }
    }

    // 2. Canonical Sheets Check
    var missingSheets = [];
    var existingSheets = Database.isMockMode() ? Object.keys(Database.getMockStore()) : [];
    if (!Database.isMockMode()) {
      var ssInstance = Database.getSpreadsheet();
      if (ssInstance) {
        existingSheets = ssInstance.getSheets().map(function(s){ return s.getName(); });
      }
    }

    for (var sName in SCHEMA) {
      if (existingSheets.indexOf(sName) === -1) {
        missingSheets.push(sName);
      }
    }

    if (missingSheets.length === 0) {
      addCheck('SCHEMA', 'Canonical 27 Sheets', 'PASS', 'Semua 27 sheet kanonikal tersedia lengkap.');
    } else {
      addCheck('SCHEMA', 'Canonical 27 Sheets', 'FAIL', 'Terdapat sheet yang belum dibuat: ' + missingSheets.join(', '));
    }

    // 3. Owner Account Check
    var activeOwners = Repository.Users.find({ role: CONFIG.ROLES.OWNER, status: CONFIG.USER_STATUS.ACTIVE });
    if (activeOwners.length > 0) {
      addCheck('AUTH', 'Active Owner Account', 'PASS', 'Tersedia ' + activeOwners.length + ' akun Owner aktif: ' + activeOwners.map(function(o){return o.email;}).join(', '));
    } else {
      addCheck('AUTH', 'Active Owner Account', 'FAIL', 'Belum ada akun Owner aktif yang terdaftar.');
    }

    // 4. Default Service Types & Workflow Templates
    var serviceTypes = Repository.ServiceTypes.getAll();
    if (serviceTypes.length > 0) {
      addCheck('WORKFLOW', 'Service Types & Workflows', 'PASS', 'Tersedia ' + serviceTypes.length + ' jenis layanan standar.');
    } else {
      addCheck('WORKFLOW', 'Service Types & Workflows', 'WARN', 'Belum ada jenis layanan standar yang diinisialisasi.');
    }

    // 5. Timezone Verification
    var timezone = Session.getScriptTimeZone ? Session.getScriptTimeZone() : CONFIG.TIMEZONE;
    if (timezone === 'Asia/Jakarta' || timezone === 'GMT+7') {
      addCheck('TIMEZONE', 'Timezone Config', 'PASS', 'Zona waktu terkonfigurasi ke Asia/Jakarta (WIB).');
    } else {
      addCheck('TIMEZONE', 'Timezone Config', 'WARN', 'Zona waktu terdeteksi: ' + timezone + ' (Disarankan Asia/Jakarta).');
    }

    // 6. Drive Root Folder Check
    var driveRootId = PropertiesService.getScriptProperties().getProperty(CONFIG.KEYS.DRIVE_ROOT_ID);
    if (driveRootId || Database.isMockMode()) {
      addCheck('STORAGE', 'Google Drive Structure', 'PASS', 'Struktur folder Google Drive siap digunakan.');
    } else {
      addCheck('STORAGE', 'Google Drive Structure', 'WARN', 'Folder Google Drive belum diinisialisasi. Jalankan setupDriveStructure().');
    }

    // 7. Last Backup Status
    var lastBackup = PropertiesService.getScriptProperties().getProperty(CONFIG.KEYS.LAST_BACKUP_TIME);
    if (lastBackup) {
      addCheck('BACKUP', 'Last Backup', 'PASS', 'Backup terakhir dilakukan pada: ' + Utils.formatDateIndo(lastBackup));
    } else {
      addCheck('BACKUP', 'Last Backup', 'WARN', 'Belum ada riwayat snapshot backup database.');
    }

    var overallStatus = hasError ? 'ERROR' : (hasWarning ? 'WARNING' : 'HEALTHY');

    return {
      status: overallStatus,
      checks: checks,
      timestamp: Utils.nowIso()
    };
  }
};
