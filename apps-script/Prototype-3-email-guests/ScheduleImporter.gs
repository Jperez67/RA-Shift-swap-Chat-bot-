function importCalendarStyleScheduleToMaster() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sourceSheet = ss.getSheetByName('Sheet1');

  if (!sourceSheet) {
    throw new Error('Could not find source sheet named Sheet1.');
  }

  let masterSheet = ss.getSheetByName(CONFIG.SHEETS.MASTER);

  if (!masterSheet) {
    masterSheet = ss.insertSheet(CONFIG.SHEETS.MASTER);
  }

  masterSheet.clearContents();

  const headers = [
    CONFIG.HEADERS.MASTER.DATE,
    CONFIG.HEADERS.MASTER.DAY,
    CONFIG.HEADERS.MASTER.SHIFT_TYPE,
    CONFIG.HEADERS.MASTER.SHIFT_SLOT,
    CONFIG.HEADERS.MASTER.ORIGINAL_RA,
    CONFIG.HEADERS.MASTER.CURRENT_RA,
    CONFIG.HEADERS.MASTER.STATUS,
    CONFIG.HEADERS.MASTER.NOTES,
    CONFIG.HEADERS.MASTER.CALENDAR_EVENT_ID
  ];

  masterSheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  const data = sourceSheet.getDataRange().getValues();
  const output = [];

  let currentMonth = null;
  let currentYear = null;
  let r = 0;

  while (r < data.length) {
    const firstCell = data[r][0];

    if (isMonthTitle_(firstCell)) {
      const parsed = parseMonthTitle_(firstCell);
      currentMonth = parsed.monthIndex;
      currentYear = parsed.year;
      r++;
      continue;
    }

    if (currentMonth === null || currentYear === null) {
      r++;
      continue;
    }

    const dateRow = data[r];
    const primaryRow = data[r + 1];
    const secondaryRow = data[r + 2];

    const hasDateNumbers = rowHasDayNumbers_(dateRow);

    if (!hasDateNumbers || !primaryRow || !secondaryRow) {
      r++;
      continue;
    }

    for (let c = 0; c < 7; c++) {
      const dayNumber = extractDayNumber_(dateRow[c]);

      if (!dayNumber) {
        continue;
      }

      const dateObj = new Date(currentYear, currentMonth, dayNumber);
      const dayName = getDayNameFromDate_(dateObj);
      const shiftType = getShiftTypeFromDate_(dateObj);

      const primaryName = extractRAName_(primaryRow[c], 'Primary');
      const secondaryName = extractRAName_(secondaryRow[c], 'Secondary');

      if (primaryName) {
        output.push([
          dateObj,
          dayName,
          shiftType,
          'Primary',
          primaryName,
          primaryName,
          'Scheduled',
          '',
          ''
        ]);
      }

      if (secondaryName) {
        output.push([
          dateObj,
          dayName,
          shiftType,
          'Secondary',
          secondaryName,
          secondaryName,
          'Scheduled',
          '',
          ''
        ]);
      }
    }

    r += 3;
  }

  if (output.length > 0) {
    masterSheet.getRange(2, 1, output.length, headers.length).setValues(output);
    masterSheet.getRange(2, 1, output.length, 1).setNumberFormat('yyyy-mm-dd');
  }

  SpreadsheetApp.flush();
  Logger.log(`Imported ${output.length} shift rows into MasterSchedule.`);
}

function rowHasDayNumbers_(row) {
  if (!row) return false;

  for (let c = 0; c < Math.min(row.length, 7); c++) {
    if (extractDayNumber_(row[c])) {
      return true;
    }
  }

  return false;
}

function isMonthTitle_(value) {
  if (!value) return false;

  const text = String(value).trim();

  return /^(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}$/i.test(text);
}

function parseMonthTitle_(value) {
  const text = String(value).trim();
  const parts = text.split(/\s+/);

  const monthName = parts[0].toLowerCase();
  const year = Number(parts[1]);

  const months = {
    january: 0,
    february: 1,
    march: 2,
    april: 3,
    may: 4,
    june: 5,
    july: 6,
    august: 7,
    september: 8,
    october: 9,
    november: 10,
    december: 11
  };

  if (!(monthName in months) || !year) {
    throw new Error(`Invalid month title: ${value}`);
  }

  return {
    monthIndex: months[monthName],
    year: year
  };
}

function extractDayNumber_(value) {
  if (!value) return null;

  if (value instanceof Date) {
    const day = value.getDate();
    if (day >= 1 && day <= 31) return day;
    return null;
  }

  const text = String(value).trim();

  if (!text) return null;

  const number = Number(text);

  if (!number || number < 1 || number > 31) {
    return null;
  }

  return number;
}

function extractRAName_(value, expectedSlot) {
  if (!value) return '';

  const text = String(value).trim();

  if (!text) return '';

  const pattern = new RegExp('^' + expectedSlot + '\\s*:\\s*', 'i');

  if (!pattern.test(text)) {
    return '';
  }

  return text.replace(pattern, '').trim();
}