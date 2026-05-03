function parseFormEvent_(e) {
  if (!e || !e.namedValues) {
    throw new Error('Missing form event data. Submit the Google Form to test this function.');
  }

  const raw = e.namedValues;
  const values = {};

  Object.keys(raw).forEach(key => {
    values[String(key).trim().toLowerCase()] = raw[key];
  });

  return {
    requestedBy: (values['requestedby'] || [''])[0],
    shiftDate: (values['shiftdate'] || [''])[0],
    shiftSlot: (values['shiftslot'] || [''])[0],
    originalRA: (values['originalra'] || [''])[0],
    replacementRA: (values['replacementra'] || [''])[0],
    reason: (values['reason'] || [''])[0],
    timestamp: (values['timestamp'] || [''])[0]
  };
}

function processSwapRequest_(request, requestRowNumber) {
  const masterSheet = getSheet_(CONFIG.SHEETS.MASTER);
  const requestSheet = getSheet_(CONFIG.SHEETS.REQUESTS);

  const masterHeaders = getHeaderMap_(masterSheet);
  const requestHeaders = getHeaderMap_(requestSheet);

  let validationResult;

  try {
    validationResult = validateSwapRequest_(request);
  } catch (error) {
    updateSwapRequestDecision_(
      requestSheet,
      requestHeaders,
      requestRowNumber,
      CONFIG.STATUS.REJECTED,
      error.message
    );

    appendAuditLog_({
      action: CONFIG.ACTIONS.SWAP_REJECTED,
      shiftDate: request.shiftDate,
      shiftSlot: request.shiftSlot,
      oldRA: request.originalRA,
      newRA: request.replacementRA,
      requestedBy: request.requestedBy,
      result: 'Error',
      notes: error.message
    });

    return;
  }

  if (!validationResult.valid) {
    updateSwapRequestDecision_(
      requestSheet,
      requestHeaders,
      requestRowNumber,
      CONFIG.STATUS.REJECTED,
      validationResult.message
    );

    appendAuditLog_({
      action: CONFIG.ACTIONS.SWAP_REJECTED,
      shiftDate: request.shiftDate,
      shiftSlot: request.shiftSlot,
      oldRA: request.originalRA,
      newRA: request.replacementRA,
      requestedBy: request.requestedBy,
      result: 'Rejected',
      notes: validationResult.message
    });

    return;
  }

  const rowNumber = validationResult.rowNumber;

  masterSheet.getRange(
    rowNumber,
    masterHeaders[CONFIG.HEADERS.MASTER.CURRENT_RA]
  ).setValue(request.replacementRA);

  masterSheet.getRange(
    rowNumber,
    masterHeaders[CONFIG.HEADERS.MASTER.STATUS]
  ).setValue(CONFIG.STATUS.SWAPPED);

  const notesCol = masterHeaders[CONFIG.HEADERS.MASTER.NOTES];
  const existingNotes = masterSheet.getRange(rowNumber, notesCol).getValue();
  const swapNote = `Swap requested by ${request.requestedBy}: ${request.originalRA} -> ${request.replacementRA}. Slot: ${request.shiftSlot}. Reason: ${request.reason}`;
  const newNotes = existingNotes ? `${existingNotes} | ${swapNote}` : swapNote;

  masterSheet.getRange(rowNumber, notesCol).setValue(newNotes);

  try {
    updateCalendarEventForRow_(rowNumber);
  } catch (error) {
    appendAuditLog_({
      action: 'Calendar Sync Failed',
      shiftDate: request.shiftDate,
      shiftSlot: request.shiftSlot,
      oldRA: request.originalRA,
      newRA: request.replacementRA,
      requestedBy: request.requestedBy,
      result: 'Error',
      notes: error.message
    });
  }
try {
  syncSheet1FromMasterSchedule();
} catch (error) {
  appendAuditLog_({
    action: 'Sheet1 Sync Failed',
    shiftDate: request.shiftDate,
    shiftSlot: request.shiftSlot,
    oldRA: request.originalRA,
    newRA: request.replacementRA,
    requestedBy: request.requestedBy,
    result: 'Error',
    notes: error.message
  });
}

  updateSwapRequestDecision_(
    requestSheet,
    requestHeaders,
    requestRowNumber,
    CONFIG.STATUS.APPROVED,
    'Swap completed successfully.'
  );

  appendAuditLog_({
    action: CONFIG.ACTIONS.SWAP_COMPLETED,
    shiftDate: request.shiftDate,
    shiftSlot: request.shiftSlot,
    oldRA: request.originalRA,
    newRA: request.replacementRA,
    requestedBy: request.requestedBy,
    result: 'Approved',
    notes: request.reason
  });
}

function updateSwapRequestDecision_(requestSheet, requestHeaders, rowNumber, decision, note) {
  const decisionCol = requestHeaders[CONFIG.HEADERS.REQUESTS.DECISION];
  const decisionNoteCol = requestHeaders[CONFIG.HEADERS.REQUESTS.DECISION_NOTE];

  if (!decisionCol) {
    throw new Error(`Missing column in ${CONFIG.SHEETS.REQUESTS}: ${CONFIG.HEADERS.REQUESTS.DECISION}`);
  }

  if (!decisionNoteCol) {
    throw new Error(`Missing column in ${CONFIG.SHEETS.REQUESTS}: ${CONFIG.HEADERS.REQUESTS.DECISION_NOTE}`);
  }

  requestSheet.getRange(rowNumber, decisionCol).setValue(decision);
  requestSheet.getRange(rowNumber, decisionNoteCol).setValue(note);
}