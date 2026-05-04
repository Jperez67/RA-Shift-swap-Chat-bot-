# Project Setup Guide

This guide explains how to set up the RA Shift Swap Chat Bot from a fresh copy of the repository.

## Prerequisites

Install or prepare these tools/accounts first:

- Git
- Python 3.10 or newer
- A Google account with access to Google Sheets, Google Calendar, and Apps Script
- An OpenAI API key
- A deployed Google Apps Script web app URL

## 1. Clone The Repository

```powershell
git clone https://github.com/Jperez67/RA-Shift-swap-Chat-bot-.git
cd RA-Shift-swap-Chat-bot-
```

## 2. Set Up The Google Sheet

Create a Google Sheet for the RA schedule. The final prototype expects these tabs:

- `MasterSchedule`
- `SwapRequests`
- `AuditLog`
- `Roster`
- `Sheet1`

`Sheet1` is used as the visual/calendar-style schedule source. The Apps Script can import from `Sheet1` into `MasterSchedule`.

### MasterSchedule Headers

Add these headers to row 1 of `MasterSchedule`:

```text
Date, Day, ShiftType, ShiftSlot, OriginalRA, CurrentRA, Status, Notes, CalendarEventId
```

### SwapRequests Headers

Add these headers to row 1 of `SwapRequests`:

```text
Timestamp, RequestedBy, ShiftDate, ShiftSlot, OriginalRA, ReplacementRA, Reason, Decision, DecisionNote
```

### AuditLog Headers

Add these headers to row 1 of `AuditLog`:

```text
Timestamp, Action, ShiftDate, ShiftSlot, OldRA, NewRA, RequestedBy, Result, Notes
```

### Roster Headers

Add these headers to row 1 of `Roster`:

```text
Name, Email, Active, CanTakeDuty
```

Fill the roster with your RA names and emails. Use values like `TRUE` or `FALSE` for `Active` and `CanTakeDuty`.

## 3. Add The Apps Script Backend

Open the Google Sheet, then go to:

```text
Extensions > Apps Script
```

Copy the files from this repo folder into the Apps Script project:

```text
apps-script/Prototype-4-ai/
```

The important files include:

- `Config.gs`
- `WebApp.gs`
- `AIParser.gs`
- `AIRouter.gs`
- `AIScheduleReader.gs`
- `CalendarSync.gs`
- `SwapProcessor.gs`
- `Validation.gs`
- `Utils.gs`
- `AdminTools.gs`
- `ScheduleImporter.gs`
- `Triggers.gs`
- `VisualCalendarSync.gs`

## 4. Configure Google Calendar

Create or choose a Google Calendar for RA duty events.

Find the calendar ID in Google Calendar:

```text
Calendar settings > Integrate calendar > Calendar ID
```

Then update `CALENDAR_ID` in `CalendarSync.gs`:

```javascript
const CALENDAR_CONFIG = {
  CALENDAR_ID: 'your-calendar-id-here',
  MANAGE_GUESTS: true
};
```

If you do not want the script to add/remove calendar guests, set `MANAGE_GUESTS` to `false`.

## 5. Add The OpenAI API Key

In Apps Script, open:

```text
Project Settings > Script Properties
```

Add this property:

```text
OPENAI_API_KEY = your_openai_api_key_here
```

Do not commit this key to GitHub.

## 6. Deploy The Apps Script Web App

In Apps Script:

1. Click `Deploy`
2. Choose `New deployment`
3. Select type `Web app`
4. Set `Execute as` to your account
5. Set access based on your project needs
6. Click `Deploy`
7. Copy the web app URL

The Streamlit app uses this URL to talk to the Apps Script backend.

You can test the backend by opening the web app URL in a browser. It should return a JSON response saying the backend is running.

## 7. Set Up The Streamlit App

From the repo root, install the Python dependencies:

```powershell
cd streamlit-app
python -m pip install -r requirements.txt
```

Create the Streamlit secrets folder if it does not already exist:

```powershell
mkdir .streamlit
```

Create this file:

```text
streamlit-app/.streamlit/secrets.toml
```

Add your Apps Script web app URL:

```toml
GOOGLE_APPS_SCRIPT_WEB_APP_URL = "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec"
```

This file is ignored by Git and should stay local.

## 8. Run The Streamlit App

From the `streamlit-app` folder, run:

```powershell
python -m streamlit run app.py
```

Streamlit should open in your browser. If it does not, open:

```text
http://localhost:8501
```

## 9. Test The System

Try these checks:

- Select a current user in the sidebar
- Confirm the backend status says `Connected`
- Ask: `Who is on duty today?`
- Ask: `Who is working this weekend?`
- Try a swap request, then use `CONFIRM` or `CANCEL`
- If you are using the `SRA` or `Admin` role, test `Sync Calendar`

## Troubleshooting

### Backend Says Missing URL

Check that this file exists:

```text
streamlit-app/.streamlit/secrets.toml
```

Make sure it contains:

```toml
GOOGLE_APPS_SCRIPT_WEB_APP_URL = "your_apps_script_web_app_url"
```

### Apps Script Says Missing OPENAI_API_KEY

Add `OPENAI_API_KEY` in Apps Script script properties.

### Calendar Sync Fails

Check that:

- `CALENDAR_ID` in `CalendarSync.gs` is correct
- Your Google account has permission to edit the calendar
- The `MasterSchedule` rows have valid dates
- The `Roster` tab has emails for the assigned RAs

### Sheet Not Found Error

Make sure the Google Sheet has all required tabs:

```text
MasterSchedule, SwapRequests, AuditLog, Roster, Sheet1
```

### Python Import Errors

Reinstall dependencies from inside `streamlit-app`:

```powershell
python -m pip install -r requirements.txt
```

## Notes For Development

- Use `apps-script/Prototype-4-ai/` for the final AI + Streamlit version.
- Keep `streamlit-app/.streamlit/secrets.toml` private.
- Commit documentation and source files, but never commit API keys or real secrets.
- After changing Apps Script code, deploy a new web app version if needed.
