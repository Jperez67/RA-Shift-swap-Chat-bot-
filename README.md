# RA-Shift-swap-Chat-bot-
This will create a multi agent chat bot that will manage two calendars, a google calendar and a master calendar in google sheets.  

Smart ChatBot for Senior Residential Assistant 

I am a Senior Residential assistant and I would like to make a way to swap shifts on a google spreadsheet. But I also have a lot of RA’s who forget about there shifts so I would like to have a google calendar and a google sheet connected so the google calendar can be sent to everyone and they will be notified but it must be accurate to the google sheet which is submitted to my Boss. Included in the shifts swap a google form could be used but all of the data must be saved to a google sheet as well saving who was swapped, reason for swap, when was it swapped, what shifts were swapped 


An AI-powered scheduling system for Residential Assistants (RAs) that automates shift management, swap requests, and calendar synchronization using Google Sheets, Google Calendar, Apps Script, and a Streamlit UI.

## Overview

This project evolves through four prototypes, gradually building a full-stack system:

- Data Layer → Google Sheets (MasterSchedule, Roster, Logs)
- Backend Logic → Google Apps Script
- Calendar Sync → Google Calendar API
- AI Layer → Natural language parsing and routing
- Frontend → Streamlit chat-based interface

The final system allows users to interact with the schedule using natural language, while maintaining safety through confirmation-based actions.

## Key Features
Centralized Scheduling
- Master schedule stored in Google Sheets
- Supports multiple shifts per day (Primary / Secondary)
- Tracks original and current RA assignments
Automated Shift Swaps
- Submit swap requests via form or AI
- Validation ensures:
  - Correct date and shift
  - Valid RA replacement
- Full audit logging of all actions

Google Calendar Integration
- Automatically creates and updates shift events
- Stores event IDs for synchronization
- Keeps calendar aligned with schedule changes

Roster & Assignment Tracking
- Maintains RA roster with eligibility flags
- Links assignments to schedule and calendar events

AI Assistant
- Understands natural language requests:
  - “Who is on duty April 24?”
  - “Who is working this weekend?”
  - “Can Alex take my shift?”
- Converts input into structured actions
- Supports multiple intents:
  - Schedule queries
  - Swap requests
  - Admin actions

Safe Execution (Confirmation System)
- AI prepares swap requests but does not execute immediately
- Requires explicit confirmation:
  - CONFIRM → executes
  - CANCEL → aborts
- Prevents unintended changes

Streamlit Web App
- Chat-based interface for interacting with the system
- User and role selection (RA / SRA / Admin)
- Displays:
  - AI responses
  - Pending swap confirmations
  - (Planned) schedule and logs

## System Architecture

Streamlit UI
-  Apps Script Web API
-  AI Parser + Router
-  Google Sheets (MasterSchedule, Roster, Logs)
-  Google Calendar

## Prototypes
### Prototype 1 — Core System
- Google Sheets-based schedule
- Automated swap processing
- Validation + audit logging
### Prototype 2 — Calendar Integration
- Google Calendar event creation
- Event updates on swaps
- Calendar sync functions
### Prototype 3 — Roster Integration
- RA roster with emails and eligibility
- Assignment tracking
- Preparation for notifications
### Prototype 4 — AI + UI
- Natural language AI assistant
- Read-only schedule queries
- Controlled swap execution (confirmation required)
- Streamlit frontend
- Apps Script Web API

## Technologies Used
- Google Apps Script
- Google Sheets
- Google Calendar
- Python (Streamlit)
- OpenAI API
- Git & GitHub

## Summary

This project demonstrates a full-stack AI-assisted scheduling system that combines:

- Automation (Apps Script)
- Data management (Sheets)
- Visualization (Calendar)
- Intelligence (AI)
- User interaction (Streamlit)

At the end of this project there should be multiple prototype
  The project has a google sheet and a google form to automatically make updates to the google sheet 
  A version of the project that has both google calendar and google sheet with info, and then a google form to control the send in the requests from RA’s
  A version that uses a chat bot and APIs to connect with the calenders 
  A version with proper guard rails and a streamlit page to control  both calendars accurately and all the extra info is properly kept up with
  **extra Add an agent to be able to use the chat bot to make/ schedule the shifts for the semester using data such as wanted days, available days, days can’t work,

## Author

Joseph Perez & Hyber Gamboa
Computer Engineering Students
University of Rhode Island


