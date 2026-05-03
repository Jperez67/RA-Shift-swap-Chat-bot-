const CALENDAR_CONFIG = {
  CALENDAR_ID:'c_3655d02b7076cd70a103e6589101aea13c58ec72bfd4f54137319a274214c0b9@group.calendar.google.com'

};

function getDutyCalendar_() {
  const calendar = CalendarApp.getCalendarById(CALENDAR_CONFIG.CALENDAR_ID);
  if (!calendar) {
    throw new Error(`Calendar not found for ID: ${CALENDAR_CONFIG.CALENDAR_ID}`);
  }
  return calendar;
}

function buildEventTitle_(rowData) {
  return ` ${rowData.shiftSlot} - ${rowData.currentRA}`;
}

function buildEventDescription_(rowData) {
  return [
    `Shift Date: ${rowData.dateKey}`,
    `Day: ${rowData.day}`,
    `Shift Type: ${rowData.shiftType}`,
    `Shift Slot: ${rowData.shiftSlot}`,
    `Original RA: ${rowData.originalRA}`,
    `Current RA: ${rowData.currentRA}`,
    `Status: ${rowData.status}`,
    `Notes: ${rowData.notes || ''}`
  ].join('\n');
}

function getMasterRowData_(rowNumber) {
  const sheet = getSheet_(CONFIG.SHEETS.MASTER);
  const headers = getHeaderMap_(sheet);
  const row = sheet.getRange(rowNumber, 1, 1, sheet.getLastColumn()).getValues()[0];

  const dateValue = row[headers[CONFIG.HEADERS.MASTER.DATE] - 1];

  return {
    rowNumber: rowNumber,
    dateValue: dateValue,
    dateKey: formatDateKey_(dateValue),
    day: row[headers[CONFIG.HEADERS.MASTER.DAY] - 1],
    shiftType: row[headers[CONFIG.HEADERS.MASTER.SHIFT_TYPE] - 1],
    shiftSlot: row[headers[CONFIG.HEADERS.MASTER.SHIFT_SLOT] - 1],
    originalRA: row[headers[CONFIG.HEADERS.MASTER.ORIGINAL_RA] - 1],
    currentRA: row[headers[CONFIG.HEADERS.MASTER.CURRENT_RA] - 1],
    status: row[headers[CONFIG.HEADERS.MASTER.STATUS] - 1],
    notes: row[headers[CONFIG.HEADERS.MASTER.NOTES] - 1],
    calendarEventId: row[headers[CONFIG.HEADERS.MASTER.CALENDAR_EVENT_ID] - 1]
  };
}

function getAllDayDateRange_(dateValue) {
  let start = dateValue instanceof Date ? new Date(dateValue) : new Date(dateValue);
  if (isNaN(start.getTime())) {
    throw new Error(`Invalid date: ${dateValue}`);
  }

  start = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return { start, end };
}

function createCalendarEventForRow_(rowNumber) {
  const sheet = getSheet_(CONFIG.SHEETS.MASTER);
  const headers = getHeaderMap_(sheet);
  const rowData = getMasterRowData_(rowNumber);

  if (rowData.calendarEventId) {
    return rowData.calendarEventId;
  }

  const calendar = getDutyCalendar_();
  const range = getAllDayDateRange_(rowData.dateValue);

  const event = calendar.createAllDayEvent(
    buildEventTitle_(rowData),
    range.start,
    {
      description: buildEventDescription_(rowData)
    }
  );

  const eventId = event.getId();

  sheet.getRange(
    rowNumber,
    headers[CONFIG.HEADERS.MASTER.CALENDAR_EVENT_ID]
  ).setValue(eventId);

  return eventId;
}

function updateCalendarEventForRow_(rowNumber) {
  const rowData = getMasterRowData_(rowNumber);
  const calendar = getDutyCalendar_();

  let event = null;

  if (rowData.calendarEventId) {
    event = calendar.getEventById(rowData.calendarEventId) || CalendarApp.getEventById(rowData.calendarEventId);
  }

  if (!event) {
    return createCalendarEventForRow_(rowNumber);
  }

  event.setTitle(buildEventTitle_(rowData));
  event.setDescription(buildEventDescription_(rowData));

  return event.getId();
}

function createCalendarEventsForAllRows() {
  const sheet = getSheet_(CONFIG.SHEETS.MASTER);
  const headers = getHeaderMap_(sheet);
  const lastRow = sheet.getLastRow();

  for (let row = 2; row <= lastRow; row++) {
    const dateValue = sheet.getRange(row, headers[CONFIG.HEADERS.MASTER.DATE]).getValue();
    if (!dateValue) continue;

    createCalendarEventForRow_(row);
  }
}
