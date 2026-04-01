# RA-Shift-swap-Chat-bot-
This will create a multi agent chat bot that will manage two calendars, a google calendar and a master calendar in google sheets.  

Joseph Perez, Hyber Gamboa 

Smart ChatBot for Senior Residential Assistant 

I am a Senior Residential assistant and I would like to make a way to swap shifts on a google spreadsheet. But I also have a lot of RA’s who forget about there shifts so I would like to have a google calendar and a google sheet connected so the google calendar can be sent to everyone and they will be notified but it must be accurate to the google sheet which is submitted to my Boss. Included in the shifts swap a google form could be used but all of the data must be saved to a google sheet as well saving who was swapped, reason for swap, when was it swapped, what shifts were swapped 

It will be a multi agent chat bot with 6 agents as listed below 
1. Intake Agent
  This agent talks to the RA and gathers the request.
  Examples:
  “I need to swap my April 12 duty shift with Alex.”
  “Who is on call next Friday?”
  “Can you show me all open swaps this month?”
  Its job is to:
  understand the request,
  extract names, dates, and reason,
  decide whether this is a question, a swap request, or a schedule change.
3. Policy / Rules Agent
  This agent checks whether the swap is allowed.
  Examples of rules:
  both RAs must exist on the team list,
  the original RA must actually be assigned that shift,
  the replacement RA cannot already be on duty that day,
  no one should exceed certain limits,
  maybe supervisors must approve some swaps.
  This is the “decision-making” agent.
4. Calendar Sync Agent
  This agent handles the Google Calendar side.
  Its job is to:
  find the duty event,
  update the event title/description or assigned person,
  preserve shared calendar visibility,
  notify the team if needed.
  Example:
  change “On Call: Joseph” to “On Call: Alex” on April 12.
5. Excel Update Agent
  This agent handles the Excel master schedule.
  Its job is to:
  open the Excel sheet,
  locate the date row,
  replace the assigned RA,
  optionally log the swap reason,
  save a clean updated copy for leadership.
  This is important because your bosses may rely on the spreadsheet even if the team uses Google Calendar.
6. Audit / Logging Agent
  This agent keeps a history of everything.
  It should log:
  who requested the change,
  original shift holder,
  replacement RA,
  date,
  timestamp,
  reason,
  approval status,
  whether Google Calendar was updated,
  whether Excel was updated.
  This protects you when there is confusion later.
7. Notification Agent
  This agent sends updates to the right people.
  Possible outputs:
  message to both RAs,
  summary to supervisors,
  confirmation like:
   “Swap approved. April 12 duty changed from Joseph to Alex in Google Calendar and Excel schedule.”

Google Sheets Tab set up
  - MasterSchedule
  - SwapRequests
  - AuditLog
  - Roster
  - Config


This will be relevant to Lab 2 for the google appscripts and google sheets, Lab 3 with the Chatbot, and finally Lab 4 with the multi agent chatbot

For APIs and tools we will be using   
  - Apps Script Spreadsheet service (SpreadsheetApp)
  - Apps Script Calendar service (CalendarApp)
  - Apps Script installable triggers
  - Google Forms / Form submit trigger support
  - OpenAI Responses API
  - Apps Script Advanced Calendar Service

At the end of this project there should be multiple prototype
  The project has a google sheet and a google form to automatically make updates to the google sheet 
  A version of the project that has both google calendar and google sheet with info, and then a google form to control the send in the requests from RA’s
  A version that uses a chat bot and APIs to connect with the calenders 
  A version with proper guard rails and a streamlit page to control  both calendars accurately and all the extra info is properly kept up with
  **extra Add an agent to be able to use the chat bot to make/ schedule the shifts for the semester using data such as wanted days, available days, days can’t work,


