function getSpreadsheet_() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

function getSheet_(sheetName) {
  const sheet = getSpreadsheet_().getSheetByName(sheetName);
  if (!sheet) {
    throw new Error(`Sheet not found: ${sheetName}`);
  }
  return sheet;
}

function getHeaderMap_(sheet) {
  const lastColumn = sheet.getLastColumn();
  const headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];

  const map = {};
  headers.forEach((header, index) => {
    map[String(header).trim()] = index + 1;
  });

  return map;
}

function normalizeName_(name) {
  return String(name || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function isTruthy_(value) {
  const v = String(value || '').trim().toLowerCase();
  return v === 'true' || v === 'yes' || v === '1';
}

function formatDateKey_(value) {
  if (!value) return '';

  const dateObj = parseLocalDate_(value);

  return Utilities.formatDate(
    dateObj,
    Session.getScriptTimeZone(),
    'yyyy-MM-dd'
  );
}

function findRowByDateAndSlot_(sheet, dateColumnName, slotColumnName, targetDate, targetSlot) {
  const headerMap = getHeaderMap_(sheet);
  const dateCol = headerMap[dateColumnName];
  const slotCol = headerMap[slotColumnName];

  if (!dateCol) {
    throw new Error(`Column not found: ${dateColumnName}`);
  }
  if (!slotCol) {
    throw new Error(`Column not found: ${slotColumnName}`);
  }

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return -1;

  const data = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
  const targetDateKey = formatDateKey_(targetDate);
  const targetSlotKey = normalizeName_(targetSlot);

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const rowDate = row[dateCol - 1];
    const rowSlot = row[slotCol - 1];

    if (!rowDate || !rowSlot) continue;

    const rowDateKey = formatDateKey_(rowDate);
    const rowSlotKey = normalizeName_(rowSlot);

    if (rowDateKey === targetDateKey && rowSlotKey === targetSlotKey) {
      return i + 2;
    }
  }

  return -1;
}

/*function findRowByDate_(sheet, dateColumnName, targetDate) {
  const headerMap = getHeaderMap_(sheet);
  const dateCol = headerMap[dateColumnName];

  if (!dateCol) {
    throw new Error(`Column not found: ${dateColumnName}`);
  }

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return -1;

  const values = sheet.getRange(2, dateCol, lastRow - 1, 1).getValues();

  const targetKey = formatDateKey_(targetDate);

  for (let i = 0; i < values.length; i++) {
    const cellValue = values[i][0];
    if (!cellValue) continue;

    const cellKey = formatDateKey_(cellValue);
    if (cellKey === targetKey) {
      return i + 2;
    }
  }

  return -1;
}*/

function getShiftTypeFromDate_(dateValue) {
  let dateObj = dateValue;

  if (!(dateObj instanceof Date)) {
    dateObj = new Date(dateValue);
  }

  if (isNaN(dateObj.getTime())) {
    throw new Error(`Invalid date for shift type: ${dateValue}`);
  }

  const dayName = Utilities.formatDate(
    dateObj,
    Session.getScriptTimeZone(),
    'EEEE'
  );

  if (dayName === 'Friday' || dayName === 'Saturday') {
    return 'Weekend';
  }

  return 'Weekday';
}

function getDayNameFromDate_(dateValue) {
  let dateObj = dateValue;

  if (!(dateObj instanceof Date)) {
    dateObj = new Date(dateValue);
  }

  if (isNaN(dateObj.getTime())) {
    throw new Error(`Invalid date for day name: ${dateValue}`);
  }

  return Utilities.formatDate(
    dateObj,
    Session.getScriptTimeZone(),
    'EEEE'
  );
}

function appendAuditLog_(entry) {
  const auditSheet = getSheet_(CONFIG.SHEETS.AUDIT);
  const headerMap = getHeaderMap_(auditSheet);

  const row = [];
  const headers = auditSheet.getRange(1, 1, 1, auditSheet.getLastColumn()).getValues()[0];

  headers.forEach(header => {
  switch (header) {
    case CONFIG.HEADERS.AUDIT.TIMESTAMP:
      row.push(new Date());
      break;
    case CONFIG.HEADERS.AUDIT.ACTION:
      row.push(entry.action || '');
      break;
    case CONFIG.HEADERS.AUDIT.SHIFT_DATE:
      row.push(entry.shiftDate || '');
      break;
    case CONFIG.HEADERS.AUDIT.SHIFT_SLOT:
      row.push(entry.shiftSlot || '');
      break;
    case CONFIG.HEADERS.AUDIT.OLD_RA:
      row.push(entry.oldRA || '');
      break;
    case CONFIG.HEADERS.AUDIT.NEW_RA:
      row.push(entry.newRA || '');
      break;
    case CONFIG.HEADERS.AUDIT.REQUESTED_BY:
      row.push(entry.requestedBy || '');
      break;
    case CONFIG.HEADERS.AUDIT.RESULT:
      row.push(entry.result || '');
      break;
    case CONFIG.HEADERS.AUDIT.NOTES:
      row.push(entry.notes || '');
      break;
    default:
      row.push('');
  }
});
  auditSheet.appendRow(row);
}

function parseLocalDate_(dateValue) {
  if (dateValue instanceof Date) {
    return new Date(
      dateValue.getFullYear(),
      dateValue.getMonth(),
      dateValue.getDate()
    );
  }

  const text = String(dateValue).trim();

  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    return new Date(
      Number(match[1]),
      Number(match[2]) - 1,
      Number(match[3])
    );
  }

  const parsed = new Date(text);
  if (isNaN(parsed.getTime())) {
    throw new Error(`Invalid date: ${dateValue}`);
  }

  return new Date(
    parsed.getFullYear(),
    parsed.getMonth(),
    parsed.getDate()
  );
}
