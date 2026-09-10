/**
 * NOTARYGO™ — Notary Office Operational Control System
 * Google Calendar Integration Service
 */

var CalendarService = {
  /**
   * Creates an event in Google Calendar for a Signing session
   * Stores and returns event ID to prevent duplicates
   */
  createSigningCalendarEvent: function(signing, matter) {
    if (Database.isMockMode()) return 'MOCK_CAL_EVENT_' + signing.signingId;

    try {
      var cal = CalendarApp.getDefaultCalendar();
      if (!cal) return '';

      var title = '[NOTARYGO] Penandatanganan Akta: ' + (matter ? matter.matterNumber : 'Perkara') + ' (' + (matter ? matter.clientNameSnapshot : '') + ')';
      var startTime = new Date(signing.date + 'T' + (signing.startTime || '09:00:00'));
      var endTime = signing.endTime ? new Date(signing.date + 'T' + signing.endTime) : new Date(startTime.getTime() + (60 * 60 * 1000)); // Default 1 hour

      var desc = 'Penandatanganan Akta melalui NOTARYGO™\n' +
        'Perkara: ' + (matter ? matter.matterNumber + ' - ' + matter.title : '-') + '\n' +
        'Peserta: ' + (signing.participants || '-') + '\n' +
        'PIC: ' + signing.PIC + '\n' +
        'Catatan: ' + (signing.notes || '-');

      var event = cal.createEvent(title, startTime, endTime, {
        description: desc,
        location: signing.location || 'Kantor Notaris & PPAT'
      });

      return event.getId();
    } catch (e) {
      return '';
    }
  },

  /**
   * Updates an existing Google Calendar event if rescheduled
   */
  updateSigningCalendarEvent: function(eventId, signing, matter) {
    if (!eventId || Database.isMockMode()) return;

    try {
      var cal = CalendarApp.getDefaultCalendar();
      var event = cal.getEventById(eventId);
      if (event) {
        var startTime = new Date(signing.date + 'T' + (signing.startTime || '09:00:00'));
        var endTime = signing.endTime ? new Date(signing.date + 'T' + signing.endTime) : new Date(startTime.getTime() + (60 * 60 * 1000));
        event.setTime(startTime, endTime);
        if (signing.location) event.setLocation(signing.location);
      }
    } catch (e) {}
  }
};
