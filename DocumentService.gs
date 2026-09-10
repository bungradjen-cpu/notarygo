/**
 * NOTARYGO™ — Notary Office Operational Control System
 * Document Center & Version Control Registry
 */

var DocumentService = {
  /**
   * Retrieves all documents with optional filters
   */
  getDocuments: function(filter) {
    Security.requireAuth();
    filter = filter || {};
    var all = Repository.Documents.getAll();

    return all.filter(function(d) {
      if (filter.matterId && d.matterId !== filter.matterId) return false;
      if (filter.documentType && d.documentType !== filter.documentType) return false;
      if (filter.status && d.status !== filter.status) return false;
      return true;
    }).sort(function(a, b) {
      return new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime();
    });
  },

  /**
   * Registers or uploads a new document version into Document Center
   */
  registerDocument: function(data, requestId) {
    var user = Security.requireAuth();
    Validation.requireFields(data, ['matterId', 'title', 'documentType']);

    // Determine version number for this document title/type in the matter
    var existingDocs = Repository.Documents.find(function(d) {
      return d.matterId === data.matterId && d.title.toLowerCase() === data.title.toLowerCase();
    });
    var nextVersion = 'V' + (existingDocs.length + 1);

    var newDoc = {
      documentId: Utils.generateId(CONFIG.PREFIX.DOCUMENT),
      matterId: data.matterId,
      documentType: data.documentType, // DRAFT_AKTA, SK, SURAT_KUASA, CHECKLIST_PDF, INVOICE_PDF, OTHER
      title: data.title.trim(),
      version: data.version || nextVersion,
      status: data.status || CONFIG.DOCUMENT_STATUS.DRAFT,
      driveFileId: data.driveFileId || '',
      driveUrl: data.driveUrl || '',
      generatedBy: user.email,
      generatedAt: Utils.nowIso(),
      visibility: data.visibility || 'INTERNAL',
      notes: data.notes || ''
    };

    var created = Repository.Documents.insert(newDoc);

    AuditService.log({
      actorUserId: user.userId,
      actorEmail: user.email,
      action: 'REGISTER_DOCUMENT',
      entityType: 'DOCUMENT',
      entityId: created.documentId,
      afterSnapshot: created,
      description: 'Mendaftarkan dokumen ' + created.title + ' (' + created.version + ') ke Document Center',
      requestId: requestId
    });

    return created;
  },

  /**
   * Updates document status (e.g. DRAFT -> APPROVED -> FINAL -> SIGNED)
   */
  updateDocumentStatus: function(documentId, status, notes, requestId) {
    var user = Security.requireAuth();
    var target = Repository.Documents.getById(documentId);
    if (!target) throw new Error('Dokumen tidak ditemukan.');

    var updates = {
      status: status,
      notes: notes !== undefined ? notes : target.notes
    };

    var updated = Repository.Documents.update(documentId, updates);

    AuditService.log({
      actorUserId: user.userId,
      actorEmail: user.email,
      action: 'UPDATE_DOCUMENT_STATUS',
      entityType: 'DOCUMENT',
      entityId: documentId,
      beforeSnapshot: target,
      afterSnapshot: updated,
      description: 'Memperbarui status dokumen ' + target.title + ' -> ' + status,
      requestId: requestId
    });

    return updated;
  },

  /**
   * Updates document metadata
   */
  updateDocument: function(documentId, data, requestId) {
    var user = Security.requireAuth();
    var target = Repository.Documents.getById(documentId);
    if (!target) throw new Error('Dokumen tidak ditemukan.');

    var updates = {};
    if (data.title !== undefined) updates.title = data.title.trim();
    if (data.documentType !== undefined) updates.documentType = data.documentType;
    if (data.driveUrl !== undefined) updates.driveUrl = data.driveUrl;
    if (data.notes !== undefined) updates.notes = data.notes;
    if (data.status !== undefined) updates.status = data.status;

    var updated = Repository.Documents.update(documentId, updates);

    AuditService.log({
      actorUserId: user.userId,
      actorEmail: user.email,
      action: 'UPDATE_DOCUMENT',
      entityType: 'DOCUMENT',
      entityId: documentId,
      beforeSnapshot: target,
      afterSnapshot: updated,
      description: 'Memperbarui metadata dokumen ' + target.title,
      requestId: requestId
    });

    return updated;
  },

  /**
   * Deletes a document from Document Center
   */
  deleteDocument: function(documentId, requestId) {
    var user = Security.requireAuth();
    var target = Repository.Documents.getById(documentId);
    if (!target) throw new Error('Dokumen tidak ditemukan.');

    var success = Repository.Documents.delete(documentId);

    AuditService.log({
      actorUserId: user.userId,
      actorEmail: user.email,
      action: 'DELETE_DOCUMENT',
      entityType: 'DOCUMENT',
      entityId: documentId,
      beforeSnapshot: target,
      description: 'Menghapus dokumen: ' + target.title + ' (' + target.version + ')',
      requestId: requestId
    });

    return { success: success, message: 'Dokumen ' + target.title + ' berhasil dihapus.' };
  }
};
