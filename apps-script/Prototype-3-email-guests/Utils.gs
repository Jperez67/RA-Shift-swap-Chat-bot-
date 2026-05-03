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

  let dateObj = value;

  if (!(dateObj instanceof Date)) {
    dateObj = new Date(value);
  }

  if (isNaN(dateObj.getTime())) {
    throw new Error(`Invalid date: ${value}`);
  }

  return Utilities.formatDate(
    dateObj,
    Session.getScriptTimeZone(),
    'yyyy-MM-dd'
  );
}

function findRowByDate_(sheet, dateColumnName, targetDate) {
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
