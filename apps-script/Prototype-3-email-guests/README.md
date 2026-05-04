## Prototype 3 — Email & Assignment Integration

## Overview
Prototype 3 enhances scheduling by connecting RA roster data to calendar events, enabling assignment tracking and preparation for notifications.

## Features
- Roster includes:
    Name
    Email
    Eligibility flags
- Calendar events can reference assigned RAs
- System prepared for:
    Email notifications
    Event guest assignments
- Improved data consistency between Sheets and Calendar

## Architecture
Roster + MasterSchedule
- Apps Script
- Calendar (with assigned users)

## Limitations
- Email sending not fully automated
- No user authentication
- Still no external UI