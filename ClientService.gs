/**
 * NOTARYGO™ — Notary Office Operational Control System
 * Client & Pre-Matter Intake Service
 */

var ClientService = {
  /**
   * Retrieves all clients
   */
  getAllClients: function() {
    Security.requireAuth();
    return Repository.Clients.getAll();
  },

  /**
   * Gets client details and full operational history
   */
  getClientDetail: function(clientId) {
    Security.requireAuth();
    var client = Repository.Clients.getById(clientId);
    if (!client) throw new Error('Client tidak ditemukan.');

    var matters = Repository.Matters.find(function(m) {
      return m.clientId === clientId;
    });

    var invoices = Repository.Invoices.find(function(inv) {
      return inv.clientId === clientId;
    });

    return {
      client: client,
      matters: matters,
      invoices: invoices
    };
  },

  /**
   * Creates a new client
   */
  createClient: function(data, requestId) {
    var user = Security.requirePermission(Permissions.LIST.CLIENT_MANAGE);
    Validation.requireFields(data, ['name']);

    var newClient = {
      clientId: Utils.generateId(CONFIG.PREFIX.CLIENT),
      clientType: data.clientType || 'INDIVIDU',
      name: data.name.trim(),
      identifier: data.identifier || '',
      phone: data.phone || '',
      email: data.email || '',
      address: data.address || '',
      company: data.company || '',
      notes: data.notes || '',
      status: 'ACTIVE',
      createdAt: Utils.nowIso(),
      createdBy: user.email,
      updatedAt: Utils.nowIso(),
      updatedBy: user.email
    };

    var created = Repository.Clients.insert(newClient);

    AuditService.log({
      actorUserId: user.userId,
      actorEmail: user.email,
      action: 'CREATE_CLIENT',
      entityType: 'CLIENT',
      entityId: created.clientId,
      afterSnapshot: created,
      description: 'Menambahkan klien baru: ' + created.name,
      requestId: requestId
    });

    return created;
  },

  /**
   * Updates an existing client
   */
  updateClient: function(clientId, data, requestId) {
    var user = Security.requirePermission(Permissions.LIST.CLIENT_MANAGE);
    var target = Repository.Clients.getById(clientId);
    if (!target) throw new Error('Client tidak ditemukan.');

    var updates = {
      clientType: data.clientType !== undefined ? data.clientType : target.clientType,
      name: data.name !== undefined ? data.name.trim() : target.name,
      identifier: data.identifier !== undefined ? data.identifier : target.identifier,
      phone: data.phone !== undefined ? data.phone : target.phone,
      email: data.email !== undefined ? data.email : target.email,
      address: data.address !== undefined ? data.address : target.address,
      company: data.company !== undefined ? data.company : target.company,
      notes: data.notes !== undefined ? data.notes : target.notes,
      updatedAt: Utils.nowIso(),
      updatedBy: user.email
    };

    var updated = Repository.Clients.update(clientId, updates);

    AuditService.log({
      actorUserId: user.userId,
      actorEmail: user.email,
      action: 'UPDATE_CLIENT',
      entityType: 'CLIENT',
      entityId: clientId,
      beforeSnapshot: target,
      afterSnapshot: updated,
      description: 'Memperbarui data klien: ' + updated.name,
      requestId: requestId
    });

    return updated;
  },

  /**
   * Deletes a client (guarded against active matters)
   */
  deleteClient: function(clientId, requestId) {
    var user = Security.requirePermission(Permissions.LIST.CLIENT_MANAGE);
    var target = Repository.Clients.getById(clientId);
    if (!target) throw new Error('Client tidak ditemukan.');

    // Check if active matters exist
    var activeMatters = Repository.Matters.find(function(m) {
      return m.clientId === clientId && m.matterStatus !== CONFIG.MATTER_STATUS.CANCELLED && m.matterStatus !== CONFIG.MATTER_STATUS.ARCHIVED;
    });

    if (activeMatters.length > 0) {
      throw new Error('Klien tidak dapat dihapus karena memiliki ' + activeMatters.length + ' perkara aktif.');
    }

    var success = Repository.Clients.delete(clientId);

    AuditService.log({
      actorUserId: user.userId,
      actorEmail: user.email,
      action: 'DELETE_CLIENT',
      entityType: 'CLIENT',
      entityId: clientId,
      beforeSnapshot: target,
      description: 'Menghapus klien: ' + target.name + ' (' + target.clientId + ')',
      requestId: requestId
    });

    return { success: success, message: 'Klien ' + target.name + ' berhasil dihapus.' };
  },

  /**
   * Retrieves all pre-matter intakes
   */
  getAllIntakes: function() {
    Security.requireAuth();
    return Repository.ClientIntakes.getAll();
  },

  /**
   * Creates a new client intake entry
   */
  createIntake: function(data, requestId) {
    var user = Security.requirePermission(Permissions.LIST.CLIENT_MANAGE);
    Validation.requireFields(data, ['clientName', 'phone', 'serviceTypeId']);

    var newIntake = {
      intakeId: Utils.generateId(CONFIG.PREFIX.INTAKE),
      clientName: data.clientName.trim(),
      phone: data.phone.trim(),
      email: data.email || '',
      serviceTypeId: data.serviceTypeId,
      organizationId: data.organizationId || '',
      description: data.description || '',
      status: data.status || CONFIG.CLIENT_INTAKE_STATUS.NEW,
      quotationAmount: Utils.parseCurrency(data.quotationAmount || 0),
      notes: data.notes || '',
      convertedMatterId: '',
      createdAt: Utils.nowIso(),
      createdBy: user.email,
      updatedAt: Utils.nowIso(),
      updatedBy: user.email
    };

    var created = Repository.ClientIntakes.insert(newIntake);

    AuditService.log({
      actorUserId: user.userId,
      actorEmail: user.email,
      action: 'CREATE_CLIENT_INTAKE',
      entityType: 'CLIENT_INTAKE',
      entityId: created.intakeId,
      afterSnapshot: created,
      description: 'Mencatat prospek/intake klien baru: ' + created.clientName,
      requestId: requestId
    });

    return created;
  },

  /**
   * Updates intake status or notes
   */
  updateIntake: function(intakeId, data, requestId) {
    var user = Security.requirePermission(Permissions.LIST.CLIENT_MANAGE);
    var target = Repository.ClientIntakes.getById(intakeId);
    if (!target) throw new Error('Intake tidak ditemukan.');

    var updates = {
      status: data.status !== undefined ? data.status : target.status,
      quotationAmount: data.quotationAmount !== undefined ? Utils.parseCurrency(data.quotationAmount) : target.quotationAmount,
      notes: data.notes !== undefined ? data.notes : target.notes,
      description: data.description !== undefined ? data.description : target.description,
      updatedAt: Utils.nowIso(),
      updatedBy: user.email
    };

    var updated = Repository.ClientIntakes.update(intakeId, updates);

    AuditService.log({
      actorUserId: user.userId,
      actorEmail: user.email,
      action: 'UPDATE_CLIENT_INTAKE',
      entityType: 'CLIENT_INTAKE',
      entityId: intakeId,
      beforeSnapshot: target,
      afterSnapshot: updated,
      description: 'Memperbarui status prospek intake: ' + updated.clientName + ' (' + updated.status + ')',
      requestId: requestId
    });

    return updated;
  },

  /**
   * Converts an Accepted Client Intake into an Active Matter
   */
  convertIntakeToMatter: function(intakeId, options, requestId) {
    var user = Security.requirePermission(Permissions.LIST.MATTER_CREATE);
    var intake = Repository.ClientIntakes.getById(intakeId);
    if (!intake) throw new Error('Intake tidak ditemukan.');

    if (intake.status === CONFIG.CLIENT_INTAKE_STATUS.CONVERTED && intake.convertedMatterId) {
      throw new Error('Intake ini sudah pernah dikonversi ke perkara: ' + intake.convertedMatterId);
    }

    // 1. Create or match Client
    var existingClient = Repository.Clients.findOne(function(c) {
      return (c.phone && c.phone === intake.phone) || (c.name.toLowerCase() === intake.clientName.toLowerCase());
    });

    var clientId = '';
    if (existingClient) {
      clientId = existingClient.clientId;
    } else {
      var newClient = ClientService.createClient({
        name: intake.clientName,
        phone: intake.phone,
        email: intake.email,
        notes: 'Dibuat otomatis dari konversi Intake ' + intake.intakeId
      }, requestId);
      clientId = newClient.clientId;
    }

    // 2. Create Matter via MatterService
    options = options || {};
    var matterPayload = {
      clientId: clientId,
      serviceTypeId: intake.serviceTypeId,
      organizationId: intake.organizationId || options.organizationId || '',
      title: options.title || ('Layanan ' + (intake.serviceTypeId || 'Perkara') + ' - ' + intake.clientName),
      description: options.description || intake.description || 'Dikonversi dari prospek intake ' + intake.intakeId,
      priority: options.priority || CONFIG.TASK_PRIORITY.MEDIUM,
      assignedPIC: options.assignedPIC || user.email,
      supervisor: options.supervisor || user.email,
      deadline: options.deadline || ''
    };

    var createdMatter = MatterService.createMatter(matterPayload, requestId);

    // 3. Update Intake to CONVERTED
    Repository.ClientIntakes.update(intakeId, {
      status: CONFIG.CLIENT_INTAKE_STATUS.CONVERTED,
      convertedMatterId: createdMatter.matterId,
      updatedAt: Utils.nowIso(),
      updatedBy: user.email
    });

    AuditService.log({
      actorUserId: user.userId,
      actorEmail: user.email,
      action: 'CONVERT_INTAKE_TO_MATTER',
      entityType: 'CLIENT_INTAKE',
      entityId: intakeId,
      description: 'Mengkonversi prospek intake ' + intake.clientName + ' menjadi perkara: ' + createdMatter.matterNumber,
      requestId: requestId
    });

    return createdMatter;
  }
};
