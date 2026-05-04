## Prototype 1 — Core Scheduling System

## Overview
Prototype 1 establishes the foundation of the RA scheduling system using Google Sheets, Google Forms, and Apps Script. It introduces a structured data model and automated shift swap processing.

## Features
- Central MasterSchedule sheet (single source of truth)
- Automated swap processing via Google Form submissions
- Validation logic for shift date, slot, and RA eligibility
- SwapRequests sheet for tracking decisions
- AuditLog for full system transparency
- Roster integration for eligibility checks
- Input normalization (handles spacing, casing, and date formats)

## Architecture

Google Form
- Apps Script Trigger
- SwapProcessor
- MasterSchedule
- SwapRequests + AuditLog

## Limitations
- No calendar integration
- No UI beyond Google Forms
- Manual schedule creation required