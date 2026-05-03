function doGet() {
  return jsonResponse_({
    ok: true,
    reply: 'RA Scheduling Assistant Apps Script backend is running.'
  });
}

function doPost(e) {
  try {
    const payload = parseRequestPayload_(e);
    const action = String(payload.action || 'chat').trim();

    switch (action) {
      case 'chat':
        return jsonResponse_({
          ok: true,
          reply: handleAIMessage(payload.message || '')
        });

      case 'sync_calendar':
        requireAdminRole_(payload);
        createCalendarEventsForAllRows();
        return jsonResponse_({
          ok: true,
          reply: 'Calendar sync completed.'
        });

      case 'rebuild_schedule':
        requireAdminRole_(payload);
        importCalendarStyleScheduleToMaster();
        createCalendarEventsForAllRows();
        return jsonResponse_({
          ok: true,
          reply: 'Schedule rebuilt and calendar events created.'
        });

      case 'get_master_schedule':
        return jsonResponse_({
          ok: true,
          rows: readSheetRecords_(CONFIG.SHEETS.MASTER)
        });

      case 'get_swap_requests':
        return jsonResponse_({
          ok: true,
          rows: readSheetRecords_(CONFIG.SHEETS.REQUESTS)
        });

      case 'get_audit_log':
        return jsonResponse_({
          ok: true,
          rows: readSheetRecords_(CONFIG.SHEETS.AUDIT)
        });

      case 'get_roster':
        return jsonResponse_({
          ok: true,
          rows: readSheetRecords_(CONFIG.SHEETS.ROSTER)
        });

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    return jsonResponse_({
      ok: false,
      error: error.message
    });
  }
}

function parseRequestPayload_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    return {};
  }

  return JSON.parse(e.postData.contents);
}

function requireAdminRole_(payload) {
  const role = String(payload.role || '').trim();

  if (role !== 'SRA' && role !== 'Admin') {
    throw new Error('This action requires SRA or Admin permissions.');
  }
}

function savePendingAIRequest_(request) {
  PropertiesService
    .getScriptProperties()
    .setProperty('PENDING_AI_REQUEST', JSON.stringify(request));
}

function getPendingAIRequest_() {
  const value = PropertiesService
    .getScriptProperties()
    .getProperty('PENDING_AI_REQUEST');

  if (!value) {
    return null;
  }

  return JSON.parse(value);
}

function clearPendingAIRequest_() {
  PropertiesService
    .getScriptProperties()
    .deleteProperty('PENDING_AI_REQUEST');
}

function readSheetRecords_(sheetName) {
  const sheet = getSheet_(sheetName);
  const values = sheet.getDataRange().getValues();

  if (values.length < 2) {
    return [];
  }

  const headers = values[0].map(header => String(header).trim());

  return values.slice(1)
    .filter(row => row.some(value => value !== ''))
    .map(row => {
      const record = {};

      headers.forEach((header, index) => {
        if (!header) return;
        record[header] = formatJsonValue_(row[index]);
      });

      return record;
    });
}

function formatJsonValue_(value) {
  if (value instanceof Date) {
    return Utilities.formatDate(
      value,
      Session.getScriptTimeZone(),
      'yyyy-MM-dd HH:mm:ss'
    );
  }

  return value;
}

function jsonResponse_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
