/**
 * NOTARYGO™ — Notary Office Operational Control System
 * Document Checklist & Completeness Engine
 */

var ChecklistService = {
  /**
   * Initializes checklist items for a matter based on its service type
   */
  initializeChecklistForMatter: function(matterId, serviceTypeId) {
    var template = Repository.ChecklistTemplates.findOne({ serviceTypeId: serviceTypeId });
    var items = [];

    if (template && template.itemsJson) {
      items = Utils.safeJsonParse(template.itemsJson, []);
    } else {
      // Default checklist fallback
      items = [
        { documentType: 'KTP Para Pihak', required: true },
        { documentType: 'Kartu Keluarga (KK)', required: true },
        { documentType: 'NPWP', required: true },
        { documentType: 'Dokumen Legalitas / Sertifikat Objek', required: true },
        { documentType: 'SPPT & Bukti Bayar PBB Terakhir', required: true },
        { documentType: 'Dokumen Pendukung Lainnya', required: false }
      ];
    }

    var createdRecords = [];
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      var rec = {
        checklistItemId: Utils.generateId(CONFIG.PREFIX.CHECKLIST_ITEM),
        matterId: matterId,
        documentType: it.documentType,
        required: it.required !== false,
        status: CONFIG.CHECKLIST_STATUS.MISSING,
        receivedDate: '',
        verifiedBy: '',
        verifiedAt: '',
        note: it.note || '',
        driveFileId: '',
        driveFileUrl: ''
      };
      createdRecords.push(rec);
    }

    return Repository.ChecklistItems.insertBatch(createdRecords);
  },

  /**
   * Calculates required document completeness percentage for a matter
   */
  calculateCompleteness: function(matterId) {
    var items = Repository.ChecklistItems.find({ matterId: matterId });
    if (items.length === 0) {
      return {
        total: 0,
        requiredTotal: 0,
        verifiedCount: 0,
        receivedCount: 0,
        missingCount: 0,
        percentage: 100,
        isComplete: true
      };
    }

    var requiredItems = items.filter(function(it) {
      return it.required === true && it.status !== CONFIG.CHECKLIST_STATUS.NOT_APPLICABLE;
    });

    var verifiedItems = requiredItems.filter(function(it) {
      return it.status === CONFIG.CHECKLIST_STATUS.VERIFIED;
    });

    var receivedItems = items.filter(function(it) {
      return it.status === CONFIG.CHECKLIST_STATUS.RECEIVED;
    });

    var missingItems = requiredItems.filter(function(it) {
      return it.status === CONFIG.CHECKLIST_STATUS.MISSING || it.status === CONFIG.CHECKLIST_STATUS.NEED_REVISION;
    });

    var totalReq = requiredItems.length;
    var verified = verifiedItems.length;
    var percentage = totalReq > 0 ? Math.round((verified / totalReq) * 100) : 100;

    return {
      total: items.length,
      requiredTotal: totalReq,
      verifiedCount: verified,
      receivedCount: receivedItems.length,
      missingCount: missingItems.length,
      percentage: percentage,
      isComplete: totalReq > 0 ? verified >= totalReq : true
    };
  },

  /**
   * Updates status of a checklist item (e.g. RECEIVED, VERIFIED, NEED_REVISION)
   */
  updateChecklistItem: function(checklistItemId, status, note, driveFileId, driveFileUrl, requestId) {
    var user = Security.requirePermission(Permissions.LIST.CHECKLIST_VERIFY);
    var target = Repository.ChecklistItems.getById(checklistItemId);
    if (!target) throw new Error('Item checklist tidak ditemukan.');

    var updates = {
      status: status,
      note: note !== undefined ? note : target.note
    };

    if (driveFileId) updates.driveFileId = driveFileId;
    if (driveFileUrl) updates.driveFileUrl = driveFileUrl;

    if (status === CONFIG.CHECKLIST_STATUS.RECEIVED && !target.receivedDate) {
      updates.receivedDate = Utils.todayIsoDate();
    } else if (status === CONFIG.CHECKLIST_STATUS.VERIFIED) {
      updates.verifiedBy = user.email;
      updates.verifiedAt = Utils.nowIso();
      if (!target.receivedDate) updates.receivedDate = Utils.todayIsoDate();
    }

    var updated = Repository.ChecklistItems.update(checklistItemId, updates);

    // Touch matter operational update
    Repository.Matters.update(target.matterId, {
      lastOperationalUpdate: Utils.nowIso(),
      updatedAt: Utils.nowIso(),
      updatedBy: user.email
    });

    AuditService.log({
      actorUserId: user.userId,
      actorEmail: user.email,
      action: 'UPDATE_CHECKLIST_ITEM',
      entityType: 'CHECKLIST',
      entityId: checklistItemId,
      beforeSnapshot: target,
      afterSnapshot: updated,
      description: 'Update checklist berkas: ' + target.documentType + ' -> ' + status,
      requestId: requestId
    });

    return updated;
  },

  /**
   * Adds custom document requirement to a matter
   */
  addChecklistItem: function(matterId, documentType, required, note, requestId) {
    var user = Security.requirePermission(Permissions.LIST.CHECKLIST_VERIFY);
    Validation.requireFields({ matterId: matterId, documentType: documentType }, ['matterId', 'documentType']);

    var newItem = {
      checklistItemId: Utils.generateId(CONFIG.PREFIX.CHECKLIST_ITEM),
      matterId: matterId,
      documentType: documentType.trim(),
      required: required !== false,
      status: CONFIG.CHECKLIST_STATUS.MISSING,
      receivedDate: '',
      verifiedBy: '',
      verifiedAt: '',
      note: note || '',
      driveFileId: '',
      driveFileUrl: ''
    };

    var created = Repository.ChecklistItems.insert(newItem);

    AuditService.log({
      actorUserId: user.userId,
      actorEmail: user.email,
      action: 'ADD_CHECKLIST_ITEM',
      entityType: 'CHECKLIST',
      entityId: created.checklistItemId,
      afterSnapshot: created,
      description: 'Menambahkan syarat dokumen baru: ' + created.documentType,
      requestId: requestId
    });

    return created;
  },

  /**
   * Generates formatted copyable text message requesting missing documents from client
   */
  generateDocumentRequestText: function(matterId) {
    var matter = Repository.Matters.getById(matterId);
    if (!matter) throw new Error('Perkara tidak ditemukan.');

    var client = Repository.Clients.getById(matter.clientId);
    var office = OfficeService.getProfile();
    var items = Repository.ChecklistItems.find({ matterId: matterId });

    var missing = items.filter(function(it) {
      return (it.status === CONFIG.CHECKLIST_STATUS.MISSING || it.status === CONFIG.CHECKLIST_STATUS.NEED_REVISION) && it.status !== CONFIG.CHECKLIST_STATUS.NOT_APPLICABLE;
    });

    if (missing.length === 0) {
      return 'Seluruh dokumen persyaratan untuk perkara ini sudah lengkap.';
    }

    var lines = [];
    lines.push('*PERMOHONAN KELENGKAPAN DOKUMEN*');
    lines.push(office.officeName.toUpperCase());
    lines.push('----------------------------------------');
    lines.push('Kepada Yth. Bpk/Ibu ' + (client ? client.name : matter.clientNameSnapshot));
    lines.push('Perihal: Kelengkapan Dokumen Perkara ' + matter.matterNumber + ' (' + matter.title + ')');
    lines.push('');
    lines.push('Guna memproses berkas akta/layanan hukum Anda, mohon bantuan untuk melengkapi dokumen berikut:');
    lines.push('');

    for (var i = 0; i < missing.length; i++) {
      var it = missing[i];
      var statusNote = it.status === CONFIG.CHECKLIST_STATUS.NEED_REVISION ? ' [PERLU REVISI' + (it.note ? ': ' + it.note : '') + ']' : '';
      lines.push((i + 1) + '. ' + it.documentType + statusNote);
    }

    lines.push('');
    lines.push('Dokumen fisik dapat diserahkan ke kantor kami atau dikirimkan salinan jelas/scan terlebih dahulu.');
    lines.push('Terima kasih atas kerja sama Anda.');
    lines.push('');
    lines.push('Salam hormat,');
    lines.push(office.notaryName);
    lines.push(office.phone ? 'Telp: ' + office.phone : '');

    return lines.join('\n');
  }
};
