function getShiftAssignment(dateValue, shiftSlot) {
  const masterSheet = getSheet_(CONFIG.SHEETS.MASTER);
  const headers = getHeaderMap_(masterSheet);

  const rowNumber = findRowByDateAndSlot_(
    masterSheet,
    CONFIG.HEADERS.MASTER.DATE,
    CONFIG.HEADERS.MASTER.SHIFT_SLOT,
    dateValue,
    shiftSlot
  );

  if (rowNumber === -1) {
    return `No ${shiftSlot} shift found for ${dateValue}.`;
  }

  const row = masterSheet
    .getRange(rowNumber, 1, 1, masterSheet.getLastColumn())
    .getValues()[0];

  const currentRA = row[headers[CONFIG.HEADERS.MASTER.CURRENT_RA] - 1];
  const status = row[headers[CONFIG.HEADERS.MASTER.STATUS] - 1];

  return `${shiftSlot} shift on ${dateValue}: ${currentRA} (${status}).`;
}

function getDaySchedule(dateValue) {
  const primary = getShiftAssignment(dateValue, 'Primary');
  const secondary = getShiftAssignment(dateValue, 'Secondary');

  return `${primary}\n${secondary}`;
}

function getWeekendSchedule(startDateValue) {
  const startDate = parseLocalDate_(startDateValue);
  
  if (isNaN(startDate.getTime())) {
    return `Invalid date: ${startDateValue}`;
  }

  const friday = new Date(startDate);
  const day = friday.getDay();

  // Move to Friday of that week
  const daysUntilFriday = (5 - day + 7) % 7;
  friday.setDate(friday.getDate() + daysUntilFriday);

  const saturday = new Date(friday);
  saturday.setDate(friday.getDate() + 1);

  const fridayKey = formatDateKey_(friday);
  const saturdayKey = formatDateKey_(saturday);

  return [
    `Weekend schedule:`,
    `Friday ${fridayKey}:`,
    getDaySchedule(fridayKey),
    ``,
    `Saturday ${saturdayKey}:`,
    getDaySchedule(saturdayKey)
  ].join('\n');
}