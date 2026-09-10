/**
 * NOTARYGO™ — Notary Office Operational Control System
 * Database Migration Engine
 */

var Migration = (function() {
  var MIGRATIONS = [
    {
      version: '1.0.0',
      description: 'Initial Core Schema (V1 Scope)',
      run: function() {
        return Database.setupDatabase();
      }
    },
    {
      version: '1.5.0',
      description: 'Professional Office Additions (Invoices, Receipts, Signing Readiness, Approvals)',
      run: function() {
        return Database.setupDatabase();
      }
    },
    {
      version: '2.0.0',
      description: 'Full Operational Control Center & Exception Engine',
      run: function() {
        return Database.setupDatabase();
      }
    }
  ];

  /**
   * Compares two semantic version strings (e.g. '1.5.0' vs '2.0.0')
   * @return {number} -1 if v1 < v2, 0 if v1 === v2, 1 if v1 > v2
   */
  function compareVersions(v1, v2) {
    if (!v1) return -1;
    if (!v2) return 1;
    var parts1 = v1.split('.').map(function(p) { return parseInt(p, 10) || 0; });
    var parts2 = v2.split('.').map(function(p) { return parseInt(p, 10) || 0; });
    for (var i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      var p1 = parts1[i] || 0;
      var p2 = parts2[i] || 0;
      if (p1 < p2) return -1;
      if (p1 > p2) return 1;
    }
    return 0;
  }

  /**
   * Gets current applied schema version
   * @return {string}
   */
  function getCurrentVersion() {
    var stored = Repository.Config.get('SCHEMA_VERSION');
    if (stored) return stored;
    var props = PropertiesService.getScriptProperties();
    return props.getProperty(CONFIG.KEYS.SCHEMA_VERSION) || '0.0.0';
  }

  /**
   * Runs all pending migrations idempotently
   * @return {Object}
   */
  function runMigrations() {
    return Database.withLock(30000, function() {
      var currentVer = getCurrentVersion();
      var applied = [];

      for (var i = 0; i < MIGRATIONS.length; i++) {
        var mig = MIGRATIONS[i];
        if (compareVersions(currentVer, mig.version) < 0) {
          mig.run();
          applied.push(mig.version);
          currentVer = mig.version;
          Repository.Config.set('SCHEMA_VERSION', mig.version, 'Applied migration ' + mig.description, 'MIGRATION_ENGINE');
          PropertiesService.getScriptProperties().setProperty(CONFIG.KEYS.SCHEMA_VERSION, mig.version);
        }
      }

      return {
        success: true,
        previousVersion: currentVer,
        currentVersion: CONFIG.SCHEMA_VERSION,
        appliedMigrations: applied
      };
    });
  }

  return {
    getCurrentVersion: getCurrentVersion,
    runMigrations: runMigrations,
    compareVersions: compareVersions
  };
})();
