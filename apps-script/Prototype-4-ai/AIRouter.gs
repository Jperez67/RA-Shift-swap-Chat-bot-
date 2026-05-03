function handleAIMessage(message) {
  const trimmedMessage = String(message || '').trim();

  if (trimmedMessage.toUpperCase() === 'CONFIRM') {
    return confirmPendingAIRequest_();
  }

  if (trimmedMessage.toUpperCase() === 'CANCEL') {
    clearPendingAIRequest_();
    return 'Pending AI request canceled.';
  }

  const parsed = parseAICommand(trimmedMessage);

  Logger.log('Parsed AI command:');
  Logger.log(JSON.stringify(parsed, null, 2));

  if (parsed.confidence < 0.6) {
    return 'I am not confident enough to answer that. Can you rephrase the request?';
  }

  switch (parsed.intent) {
    case 'ask_shift':
      if (!parsed.shiftDate) {
        return 'I need a date to check the shift.';
      }

      if (!parsed.shiftSlot) {
        return getDaySchedule(parsed.shiftDate);
      }

      return getShiftAssignment(parsed.shiftDate, parsed.shiftSlot);

    case 'ask_day_schedule':
      if (!parsed.shiftDate) {
        return 'I need a date to check the schedule.';
      }

      return getDaySchedule(parsed.shiftDate);

    case 'ask_weekend_schedule':
      if (!parsed.shiftDate) {
        return 'I need a date from that weekend.';
      }

      return getWeekendSchedule(parsed.shiftDate);

    case 'request_swap':
      return prepareAISwapRequest_(parsed);

    case 'admin_resync':
      return 'I understood this as an admin resync request, but Prototype 4C does not run admin actions yet.';

    default:
      return 'I could not understand that request yet.';
  }
}

function prepareAISwapRequest_(parsed) {
  const missing = [];

  if (!parsed.shiftDate) missing.push('shiftDate');
  if (!parsed.shiftSlot) missing.push('shiftSlot');
  if (!parsed.originalRA) missing.push('originalRA');
  if (!parsed.replacementRA) missing.push('replacementRA');

  if (missing.length > 0) {
    return [
      'I understood this as a swap request, but I need more information before I can prepare it.',
      `Missing: ${missing.join(', ')}`,
      '',
      'Please include the shift date, shift slot, current assigned RA, and replacement RA.'
    ].join('\n');
  }

  const request = {
    requestedBy: parsed.originalRA,
    shiftDate: parsed.shiftDate,
    shiftSlot: parsed.shiftSlot,
    originalRA: parsed.originalRA,
    replacementRA: parsed.replacementRA,
    reason: parsed.reason || 'AI submitted swap request'
  };

  const validationResult = validateSwapRequest_(request);

  if (!validationResult.valid) {
    return [
      'I understood this as a swap request, but it failed validation.',
      validationResult.message
    ].join('\n');
  }

  savePendingAIRequest_(request);

  return [
    'I understood this as a swap request:',
    '',
    `Date: ${request.shiftDate}`,
    `Slot: ${request.shiftSlot}`,
    `Current Assigned RA: ${request.originalRA}`,
    `Replacement RA: ${request.replacementRA}`,
    `Reason: ${request.reason}`,
    '',
    'Type CONFIRM to complete this swap, or CANCEL to stop.'
  ].join('\n');
}

function confirmPendingAIRequest_() {
  const request = getPendingAIRequest_();

  if (!request) {
    return 'There is no pending AI request to confirm.';
  }

  const requestSheet = getSheet_(CONFIG.SHEETS.REQUESTS);
  const requestHeaders = getHeaderMap_(requestSheet);

  const newRow = buildSwapRequestRow_(requestSheet, request);
  requestSheet.appendRow(newRow);

  const requestRowNumber = requestSheet.getLastRow();

  processSwapRequest_(request, requestRowNumber);

  clearPendingAIRequest_();

  return [
    'Swap request confirmed and processed.',
    '',
    `Date: ${request.shiftDate}`,
    `Slot: ${request.shiftSlot}`,
    `${request.originalRA} → ${request.replacementRA}`
  ].join('\n');
}

function buildSwapRequestRow_(requestSheet, request) {
  const headers = requestSheet
    .getRange(1, 1, 1, requestSheet.getLastColumn())
    .getValues()[0];

  return headers.map(header => {
    const cleanHeader = String(header).trim();

    switch (cleanHeader) {
      case CONFIG.HEADERS.REQUESTS.TIMESTAMP:
        return new Date();

      case CONFIG.HEADERS.REQUESTS.REQUESTED_BY:
        return request.requestedBy || '';

      case CONFIG.HEADERS.REQUESTS.SHIFT_DATE:
        return request.shiftDate || '';

      case CONFIG.HEADERS.REQUESTS.SHIFT_SLOT:
        return request.shiftSlot || '';

      case CONFIG.HEADERS.REQUESTS.ORIGINAL_RA:
        return request.originalRA || '';

      case CONFIG.HEADERS.REQUESTS.REPLACEMENT_RA:
        return request.replacementRA || '';

      case CONFIG.HEADERS.REQUESTS.REASON:
        return request.reason || '';

      case CONFIG.HEADERS.REQUESTS.DECISION:
        return '';

      case CONFIG.HEADERS.REQUESTS.DECISION_NOTE:
        return '';

      default:
        return '';
    }
  });
}

function testAISwapPrepare() {
  const response = handleAIMessage(
    'Anthony wants Cameron to take the Primary shift on April 24, 2026 because of class.'
  );

  Logger.log(response);
}

function testAISwapConfirm() {
  const response = handleAIMessage('CONFIRM');
  Logger.log(response);
}

function testAISwapCancel() {
  const response = handleAIMessage('CANCEL');
  Logger.log(response);
}