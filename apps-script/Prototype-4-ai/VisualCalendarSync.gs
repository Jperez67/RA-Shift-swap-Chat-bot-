function syncSheet1FromMasterSchedule() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const masterSheet = getSheet_(CONFIG.SHEETS.MASTER);
  const calendarSheet = ss.getSheetByName('Sheet1');

  if (!calendarSheet) {
    throw new Error('Sheet1 not found.');
  }

  const masterHeaders = getHeaderMap_(masterSheet);
  const masterData = masterSheet.getDataRange().getValues();

  const sheet1Data = calendarSheet.getDataRange().getValues();

  let currentMonth = null;
  let currentYear = null;

  for (let r = 0; r < sheet1Data.length; r++) {
    const firstCell = sheet1Data[r][0];

    if (isMonthTitle_(firstCell)) {
      const parsed = parseMonthTitle_(firstCell);
      currentMonth = parsed.monthIndex;
      currentYear = parsed.year;
      continue;
    }

    if (currentMonth === null || currentYear === null) {
      continue;
    }

    const dateRow = sheet1Data[r];
    const primaryRowIndex = r + 1;
    const secondaryRowIndex = r + 2;

    if (!rowHasDayNumbers_(dateRow)) {
      continue;
    }

    for (let c = 0; c < 7; c++) {
      const dayNumber = extractDayNumber_(dateRow[c]);
      if (!dayNumber) continue;

      const dateObj = new Date(currentYear, currentMonth, dayNumber);
      const dateKey = formatDateKey_(dateObj);

      const primaryRA = findCurrentRAInMaster_(
        masterData,
        masterHeaders,
        dateKey,
        'Primary'
      );

      const secondaryRA = findCurrentRAInMaster_(
        masterData,
        masterHeaders,
        dateKey,
        'Secondary'
      );

      if (primaryRA) {
        calendarSheet
          .getRange(primaryRowIndex + 1, c + 1)
          .setValue(`Primary: ${primaryRA}`);
      }

      if (secondaryRA) {
        calendarSheet
          .getRange(secondaryRowIndex + 1, c + 1)
          .setValue(`Secondary: ${secondaryRA}`);
      }
    }
  }

  SpreadsheetApp.flush();
}

function findCurrentRAInMaster_(masterData, masterHeaders, dateKey, shiftSlot) {
  const dateCol = masterHeaders[CONFIG.HEADERS.MASTER.DATE] - 1;
  const slotCol = masterHeaders[CONFIG.HEADERS.MASTER.SHIFT_SLOT] - 1;
  const currentRACol = masterHeaders[CONFIG.HEADERS.MASTER.CURRENT_RA] - 1;

  for (let i = 1; i < masterData.length; i++) {
    const row = masterData[i];

    const rowDate = row[dateCol];
    const rowSlot = row[slotCol];

    if (!rowDate || !rowSlot) continue;

    const rowDateKey = formatDateKey_(rowDate);
    const rowSlotKey = normalizeName_(rowSlot);

    if (
      rowDateKey === dateKey &&
      rowSlotKey === normalizeName_(shiftSlot)
    ) {
      return row[currentRACol];
    }
  }

  return '';
}