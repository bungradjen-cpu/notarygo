/**
 * NOTARYGO™ — Notary Office Operational Control System
 * Google Drive Folder Architecture & File Storage Service
 */

var DriveService = {
  /**
   * Initializes the root Google Drive structure idempotently
   * @return {Object} Folder IDs map
   */
  setupDriveStructure: function() {
    if (Database.isMockMode()) {
      return {
        rootId: 'MOCK_DRIVE_ROOT',
        systemId: 'MOCK_00_SYSTEM',
        backupId: 'MOCK_BACKUP',
        mattersId: 'MOCK_01_MATTERS',
        reportsId: 'MOCK_02_REPORTS',
        invoicesId: 'MOCK_03_INVOICES',
        archiveId: 'MOCK_04_ARCHIVE'
      };
    }

    var props = PropertiesService.getScriptProperties();
    var rootId = props.getProperty(CONFIG.KEYS.DRIVE_ROOT_ID);
    var rootFolder = null;

    if (rootId) {
      try {
        rootFolder = DriveApp.getFolderById(rootId);
      } catch (e) {}
    }

    if (!rootFolder) {
      rootFolder = DriveApp.createFolder('NOTARYGO');
      props.setProperty(CONFIG.KEYS.DRIVE_ROOT_ID, rootFolder.getId());
    }

    function getOrCreateSubFolder(parent, name) {
      var folders = parent.getFoldersByName(name);
      if (folders.hasNext()) {
        return folders.next();
      }
      return parent.createFolder(name);
    }

    var systemFolder = getOrCreateSubFolder(rootFolder, '00_SYSTEM');
    var logoFolder = getOrCreateSubFolder(systemFolder, 'LOGO');
    var tplFolder = getOrCreateSubFolder(systemFolder, 'TEMPLATES');
    var backupFolder = getOrCreateSubFolder(systemFolder, 'BACKUP');

    var mattersFolder = getOrCreateSubFolder(rootFolder, '01_MATTERS');
    var reportsFolder = getOrCreateSubFolder(rootFolder, '02_REPORTS');
    var invoicesFolder = getOrCreateSubFolder(rootFolder, '03_INVOICES');
    var archiveFolder = getOrCreateSubFolder(rootFolder, '04_ARCHIVE');

    var result = {
      rootId: rootFolder.getId(),
      systemId: systemFolder.getId(),
      logoId: logoFolder.getId(),
      templateId: tplFolder.getId(),
      backupId: backupFolder.getId(),
      mattersId: mattersFolder.getId(),
      reportsId: reportsFolder.getId(),
      invoicesId: invoicesFolder.getId(),
      archiveId: archiveFolder.getId()
    };

    props.setProperty('DRIVE_BACKUP_FOLDER_ID', result.backupId);
    props.setProperty('DRIVE_MATTERS_FOLDER_ID', result.mattersId);

    return result;
  },

  /**
   * Gets or creates a structured matter folder with subfolders
   * Structure: 01_MATTERS / YEAR / MATTER_NUMBER_CLIENT / (01_CLIENT_DOCUMENT, 02_DRAFT, 03_REVIEW, 04_SIGNING, 05_INVOICE, 06_FINAL)
   */
  createMatterFolderStructure: function(matterNumber, clientName) {
    if (Database.isMockMode()) return 'MOCK_MATTER_FOLDER_' + matterNumber;

    try {
      var props = PropertiesService.getScriptProperties();
      var mattersFolderId = props.getProperty('DRIVE_MATTERS_FOLDER_ID');
      var mattersFolder = mattersFolderId ? DriveApp.getFolderById(mattersFolderId) : null;
      if (!mattersFolder) {
        var struct = this.setupDriveStructure();
        mattersFolder = DriveApp.getFolderById(struct.mattersId);
      }

      var currentYear = String(new Date().getFullYear());
      var yearFolders = mattersFolder.getFoldersByName(currentYear);
      var yearFolder = yearFolders.hasNext() ? yearFolders.next() : mattersFolder.createFolder(currentYear);

      var safeClient = (clientName || 'Client').replace(/[^a-zA-Z0-9_\- ]/g, '');
      var folderName = matterNumber + '_' + safeClient;
      var matterFolder = yearFolder.createFolder(folderName);

      // Create standardized subfolders
      matterFolder.createFolder('01_CLIENT_DOCUMENT');
      matterFolder.createFolder('02_DRAFT');
      matterFolder.createFolder('03_REVIEW');
      matterFolder.createFolder('04_SIGNING');
      matterFolder.createFolder('05_INVOICE');
      matterFolder.createFolder('06_FINAL');

      return matterFolder.getId();
    } catch (e) {
      return '';
    }
  },

  getSystemBackupFolderId: function() {
    var props = PropertiesService.getScriptProperties();
    return props.getProperty('DRIVE_BACKUP_FOLDER_ID') || '';
  }
};
