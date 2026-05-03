function deleteAllCalendarEventsFromMaster() {
  const sheet = getSheet_(CONFIG.SHEETS.MASTER);
  const headers = getHeaderMap_(sheet);

  const lastRow = sheet.getLastRow();
  const calendar = getDutyCalendar_();

  for (let row = 2; row <= lastRow; row++) {
    const eventId = sheet.getRange(
      row,
      headers[CONFIG.HEADERS.MASTER.CALENDAR_EVENT_ID]
    ).getValue();

    if (!eventId) continue;

    try {
      const event = calendar.getEventById(eventId) || CalendarApp.getEventById(eventId);

      if (event) {
        event.deleteEvent();
      }
    } catch (err) {
      Logger.log(`Failed to delete event at row ${row}: ${err.message}`);
    }
  }
}

function clearAllData() {
  const sheets = [
    CONFIG.SHEETS.MASTER,
    CONFIG.SHEETS.REQUESTS,
    CONFIG.SHEETS.AUDIT
  ];

  sheets.forEach(name => {
    const sheet = getSheet_(name);
    const lastRow = sheet.getLastRow();

    if (lastRow > 1) {
      sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clearContent();
    }
  });

  Logger.log('All sheet data cleared.');
}

function fullResetSystem() {
  deleteAllCalendarEventsFromMaster();
  clearAllData();
  Logger.log('Full system reset complete.');
}

function rebuildMasterScheduleAndCalendar() {
  // 1. Delete old calendar events that are linked in MasterSchedule
  deleteAllCalendarEventsFromMaster();

  // 2. Import Sheet1 calendar-style schedule into MasterSchedule
  importCalendarStyleScheduleToMaster();

  // 3. Create Google Calendar events from the new MasterSchedule
  createCalendarEventsForAllRows();

  Logger.log('MasterSchedule rebuilt and Google Calendar events created.');
}