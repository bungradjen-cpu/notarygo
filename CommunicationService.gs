/**
 * NOTARYGO™ — Notary Office Operational Control System
 * Formal Client & Partner Communication Log Service
 */

var CommunicationService = {
  /**
   * Retrieves communication logs for a matter
   */
  getMatterCommunications: function(matterId) {
    Security.requireAuth();
    var all = Repository.Communications.find({ matterId: matterId });
    return all.sort(function(a, b) {
      return new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime();
    });
  },

  /**
   * Records a formal communication note
   */
  logCommunication: function(data, requestId) {
    var user = Security.requireAuth();
    Validation.requireFields(data, ['matterId', 'party', 'channel', 'summary']);

    var matter = Repository.Matters.getById(data.matterId);
    if (!matter) throw new Error('Perkara tidak ditemukan.');

    var newComm = {
      communicationId: Utils.generateId(CONFIG.PREFIX.COMMUNICATION),
      matterId: data.matterId,
      party: data.party.trim(),
      channel: data.channel, // WHATSAPP, PHONE, EMAIL, MEETING, OFFICIAL_LETTER
      dateTime: data.dateTime || Utils.nowIso(),
      summary: data.summary.trim(),
      nextAction: data.nextAction || '',
      PIC: data.PIC || user.email,
      createdBy: user.email,
      createdAt: Utils.nowIso()
    };

    var created = Repository.Communications.insert(newComm);

    // Update Matter next action if specified
    if (data.nextAction) {
      Repository.Matters.update(data.matterId, {
        nextAction: data.nextAction,
        lastOperationalUpdate: Utils.nowIso(),
        updatedAt: Utils.nowIso(),
        updatedBy: user.email
      });
    }

    AuditService.log({
      actorUserId: user.userId,
      actorEmail: user.email,
      action: 'LOG_COMMUNICATION',
      entityType: 'COMMUNICATION',
      entityId: created.communicationId,
      afterSnapshot: created,
      description: 'Mencatat komunikasi penting perkara ' + matter.matterNumber + ' dengan ' + created.party + ' via ' + created.channel,
      requestId: requestId
    });

    return created;
  }
};
