## Prototype 2 — Google Calendar Integration

## Overview
Prototype 2 extends the scheduling system by integrating Google Calendar, allowing shifts to be visualized and synchronized as calendar events.

## Features
- Automatic creation of all-day calendar events
- Event updates when swaps occur
- Event descriptions include:
    Shift date
    RA assignment
    Shift type and slot
- Stores CalendarEventId in MasterSchedule
- Bulk sync function:
    createCalendarEventsForAllRows_()

## Architecture
MasterSchedule
- Apps Script
- Google Calendar API
- Calendar 

## Limitations
- No email invites yet
- Calendar must be manually synced initially
- No UI control for calendar actions