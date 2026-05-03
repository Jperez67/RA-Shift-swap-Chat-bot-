const CONFIG = {
  SHEETS: {
    MASTER: 'MasterSchedule',
    REQUESTS: 'SwapRequests',
    AUDIT: 'AuditLog',
    ROSTER: 'Roster'
  },

  HEADERS: {
    MASTER: {
      DATE: 'Date',
      DAY: 'Day',
      SHIFT_TYPE: 'ShiftType',
      SHIFT_SLOT: 'ShiftSlot',
      ORIGINAL_RA: 'OriginalRA',
      CURRENT_RA: 'CurrentRA',
      STATUS: 'Status',
      NOTES: 'Notes',
      CALENDAR_EVENT_ID: 'CalendarEventId'
    },

    REQUESTS: {
      TIMESTAMP: 'Timestamp',
      REQUESTED_BY: 'RequestedBy',
      SHIFT_DATE: 'ShiftDate',
      SHIFT_SLOT: 'ShiftSlot',
      ORIGINAL_RA: 'OriginalRA',
      REPLACEMENT_RA: 'ReplacementRA',
      REASON: 'Reason',
      DECISION: 'Decision',
      DECISION_NOTE: 'DecisionNote'
    },

    AUDIT: {
      TIMESTAMP: 'Timestamp',
      ACTION: 'Action',
      SHIFT_DATE: 'ShiftDate',
      SHIFT_SLOT: 'ShiftSlot',
      OLD_RA: 'OldRA',
      NEW_RA: 'NewRA',
      REQUESTED_BY: 'RequestedBy',
      RESULT: 'Result',
      NOTES: 'Notes'
    },

    ROSTER: {
      NAME: 'Name',
      EMAIL: 'Email',
      ACTIVE: 'Active',
      CAN_TAKE_DUTY: 'CanTakeDuty'
    }
  },

  STATUS: {
    SWAPPED: 'Swapped',
    APPROVED: 'Approved',
    REJECTED: 'Rejected'
  },

  ACTIONS: {
    SWAP_COMPLETED: 'Swap Completed',
    SWAP_REJECTED: 'Swap Rejected'
  }
};