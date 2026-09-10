/**
 * NOTARYGO™ — Notary Office Operational Control System
 * Organization & Partner Management Service
 */

var OrganizationService = {
  /**
   * Retrieves all partner organizations (Bank, Developer, Corporate, etc.)
   */
  getAllOrganizations: function() {
    Security.requireAuth();
    return Repository.Organizations.getAll();
  },

  /**
   * Retrieves organization by ID with associated matters
   */
  getOrganizationDetail: function(organizationId) {
    Security.requireAuth();
    var org = Repository.Organizations.getById(organizationId);
    if (!org) throw new Error('Organisasi mitra tidak ditemukan.');

    var matters = Repository.Matters.find(function(m) {
      return m.organizationId === organizationId;
    });

    return {
      organization: org,
      matters: matters
    };
  },

  /**
   * Creates a new organization
   */
  createOrganization: function(data, requestId) {
    var user = Security.requirePermission(Permissions.LIST.ORGANIZATION_MANAGE);
    Validation.requireFields(data, ['name', 'type']);

    var newOrg = {
      organizationId: Utils.generateId(CONFIG.PREFIX.ORG),
      name: data.name.trim(),
      type: data.type, // BANK, DEVELOPER, CORPORATE, AGENCY, OTHER
      contactPerson: data.contactPerson || '',
      phone: data.phone || '',
      email: data.email || '',
      address: data.address || '',
      notes: data.notes || '',
      status: 'ACTIVE',
      createdAt: Utils.nowIso(),
      createdBy: user.email,
      updatedAt: Utils.nowIso(),
      updatedBy: user.email
    };

    var created = Repository.Organizations.insert(newOrg);

    AuditService.log({
      actorUserId: user.userId,
      actorEmail: user.email,
      action: 'CREATE_ORGANIZATION',
      entityType: 'ORGANIZATION',
      entityId: created.organizationId,
      afterSnapshot: created,
      description: 'Menambahkan organisasi mitra baru: ' + created.name + ' (' + created.type + ')',
      requestId: requestId
    });

    return created;
  },

  /**
   * Updates an existing organization
   */
  updateOrganization: function(organizationId, data, requestId) {
    var user = Security.requirePermission(Permissions.LIST.ORGANIZATION_MANAGE);
    var target = Repository.Organizations.getById(organizationId);
    if (!target) throw new Error('Organisasi mitra tidak ditemukan.');

    var updates = {
      name: data.name !== undefined ? data.name.trim() : target.name,
      type: data.type !== undefined ? data.type : target.type,
      contactPerson: data.contactPerson !== undefined ? data.contactPerson : target.contactPerson,
      phone: data.phone !== undefined ? data.phone : target.phone,
      email: data.email !== undefined ? data.email : target.email,
      address: data.address !== undefined ? data.address : target.address,
      notes: data.notes !== undefined ? data.notes : target.notes,
      status: data.status !== undefined ? data.status : target.status,
      updatedAt: Utils.nowIso(),
      updatedBy: user.email
    };

    var updated = Repository.Organizations.update(organizationId, updates);

    AuditService.log({
      actorUserId: user.userId,
      actorEmail: user.email,
      action: 'UPDATE_ORGANIZATION',
      entityType: 'ORGANIZATION',
      entityId: organizationId,
      beforeSnapshot: target,
      afterSnapshot: updated,
      description: 'Memperbarui data organisasi mitra: ' + updated.name,
      requestId: requestId
    });

    return updated;
  },

  /**
   * Deletes an organization
   */
  deleteOrganization: function(organizationId, requestId) {
    var user = Security.requirePermission(Permissions.LIST.ORGANIZATION_MANAGE);
    var target = Repository.Organizations.getById(organizationId);
    if (!target) throw new Error('Organisasi mitra tidak ditemukan.');

    var success = Repository.Organizations.delete(organizationId);

    AuditService.log({
      actorUserId: user.userId,
      actorEmail: user.email,
      action: 'DELETE_ORGANIZATION',
      entityType: 'ORGANIZATION',
      entityId: organizationId,
      beforeSnapshot: target,
      description: 'Menghapus organisasi mitra: ' + target.name + ' (' + target.organizationId + ')',
      requestId: requestId
    });

    return { success: success, message: 'Mitra ' + target.name + ' berhasil dihapus.' };
  }
};
