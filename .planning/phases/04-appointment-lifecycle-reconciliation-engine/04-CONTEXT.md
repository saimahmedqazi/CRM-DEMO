# Phase 4 Context: Appointment Lifecycle & Reconciliation Engine

## Overview
Phase 4 implements appointment scheduling, attendance outcomes, and external calendar event reconciliation for Kuro Solutions CRM.
In appointment-led practices like Hoffman Audiology Inc., the CRM must bridge the gap between initial lead inquiries and real-world clinical appointments without double-counting conversions or misattributing appointments.

## Core Requirements & Objectives
- **APPT-01**: PostgreSQL schema `appointments` and `unmatched_bookings` with strict Row-Level Security (`organization_id`).
- **APPT-02**: Appointment scheduling, rescheduling, cancellation, and attendance status management (requested, confirmed, attended, cancelled, no_show).
- **APPT-03**: Verified clinical/commercial outcomes (e.g. Hearing Aid Fitted, Assessment Completed, Follow-up Advised, Medical Referral, Wax Cleared) that feed into pipeline status and activity history.
- **APPT-04**: Deterministic calendar reconciliation engine matching external calendar bookings (Google Calendar, Outlook, Calendly) to contacts by normalized E.164 phone and email with idempotency.
- **APPT-05**: Unmatched Booking Review Queue UI allowing staff to manually match or create a new contact for ambiguous bookings, ensuring zero silent false merges.

## Architecture & Integration Points
- `supabase/migrations/20261029000004_appointments_and_reconciliation.sql`: Schema with forced RLS.
- `lib/services/appointment-service.ts`: Appointment CRUD, outcome logging, and calendar reconciliation engine.
- `app/(dashboard)/[orgSlug]/appointments/page.tsx`: Appointment view (list/calendar view), scheduling dialog, outcome dialog, and Unmatched Bookings Review Queue tab.
- `tests/unit/appointment-reconciliation.test.ts`: Unit tests validating reconciliation heuristics, idempotency keys, and unmatched queue routing.
