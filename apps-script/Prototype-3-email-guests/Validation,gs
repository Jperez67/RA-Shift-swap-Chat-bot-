function getRosterLookup_() {
  const rosterSheet = getSheet_(CONFIG.SHEETS.ROSTER);
  const headerMap = getHeaderMap_(rosterSheet);

  const lastRow = rosterSheet.getLastRow();
  if (lastRow < 2) return {};

  const data = rosterSheet.getRange(2, 1, lastRow - 1, rosterSheet.getLastColumn()).getValues();
  const lookup = {};

  data.forEach(row => {
    const name = row[headerMap[CONFIG.HEADERS.ROSTER.NAME] - 1];
    const email = row[headerMap[CONFIG.HEADERS.ROSTER.EMAIL] - 1];
    const active = row[headerMap[CONFIG.HEADERS.ROSTER.ACTIVE] - 1];
    const canTakeDuty = row[headerMap[CONFIG.HEADERS.ROSTER.CAN_TAKE_DUTY] - 1];

    const normalized = normalizeName_(name);
    if (!normalized) return;

    lookup[normalized] = {
      name: name,
      email: email,
      active: isTruthy_(active),
      canTakeDuty: isTruthy_(canTakeDuty)
    };
  });

  return lookup;
}

function validateReplacementRA_(replacementRA) {
  const roster = getRosterLookup_();
  const normalized = normalizeName_(replacementRA);

  if (!roster[normalized]) {
    return {
      valid: false,
      message: `Replacement RA "${replacementRA}" is not in the roster.`
    };
  }

  if (!roster[normalized].active) {
    return {
      valid: false,
      message: `Replacement RA "${replacementRA}" is not active.`
    };
  }

  if (!roster[normalized].canTakeDuty) {
    return {
      valid: false,
      message: `Replacement RA "${replacementRA}" is not eligible to take duty.`
    };
  }

  return {
    valid: true,
    rosterEntry: roster[normalized]
  };
}

function validateSwapRequest_(request) {
  const masterSheet = getSheet_(CONFIG.SHEETS.MASTER);
  const masterHeaders = getHeaderMap_(masterSheet);

  const rowNumber = findRowByDateAndSlot_(
    masterSheet,
    CONFIG.HEADERS.MASTER.DATE,
    CONFIG.HEADERS.MASTER.SHIFT_SLOT,
    request.shiftDate,
    request.shiftSlot
  );

  if (rowNumber === -1) {
    return {
      valid: false,
      message: `No shift found for date ${request.shiftDate} and slot ${request.shiftSlot}.`
    };
  }

  const rowValues = masterSheet
    .getRange(rowNumber, 1, 1, masterSheet.getLastColumn())
    .getValues()[0];

  const currentRA = rowValues[masterHeaders[CONFIG.HEADERS.MASTER.CURRENT_RA] - 1];
  const currentRANormalized = normalizeName_(currentRA);
  const requestOriginalNormalized = normalizeName_(request.originalRA);
  const replacementNormalized = normalizeName_(request.replacementRA);

  if (currentRANormalized !== requestOriginalNormalized) {
    return {
      valid: false,
      message: `Original RA mismatch. Sheet shows "${currentRA}" for ${request.shiftSlot} on that date.`
    };
  }

  if (requestOriginalNormalized === replacementNormalized) {
    return {
      valid: false,
      message: 'Original RA and replacement RA cannot be the same person.'
    };
  }

  const replacementCheck = validateReplacementRA_(request.replacementRA);
  if (!replacementCheck.valid) {
    return replacementCheck;
  }

  return {
    valid: true,
    rowNumber: rowNumber,
    currentRA: currentRA
  };
}