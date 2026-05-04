## Prototype 4 — AI + Multi-Agent System + UI

## Overview
Prototype 4 introduces an AI-powered interface and a Streamlit frontend, transforming the system into an interactive scheduling assistant.

## Features
AI System
- Natural language parsing using OpenAI
- Converts user input → structured JSON
- Supports intents:
    ask_shift
    ask_day_schedule
    ask_weekend_schedule
    request_swap
    admin_resync
Read-Only AI Queries (4B)
- Ask schedule questions:
    “Who is on duty April 24?”
    “Who is working this weekend?”
- Pulls directly from MasterSchedule

Controlled Actions (4C)
- Swap requests require confirmation:
    AI prepares request
    User confirms (CONFIRM)
    System executes swap
- Prevents unintended changes
Web API (Apps Script)
- Exposes backend via doPost
- Supports actions:
    chat
    sync_calendar
    rebuild_schedule
    get_master_schedule
    get_swap_requests
    get_audit_log
    get_roster

Streamlit Frontend (4D)
- Chat-based interface
- User and role selection
- Real-time interaction with backend
- Displays:
    Chat responses
    Pending swap confirmations
    Schedule data (planned)

## Architecture
Streamlit UI
- Apps Script Web API
- AI Parser + Router
- MasterSchedule / Calendar / Sheets

Limitations
- No authentication (user identity not enforced)
- Some operations may be slow (calendar sync)
- UI still in development
- Admin controls not fully secured