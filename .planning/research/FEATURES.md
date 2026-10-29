# Feature Research

**Domain:** Multi-Tenant Appointment-Led CRM SaaS
**Researched:** 2026-10-29
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist in any commercial CRM. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Multi-Channel Lead Ingestion | Inquiries arrive via forms, phone, WhatsApp, email, social ads. | HIGH | Central inbox must normalize payloads across channels with source attribution. |
| Fast Lead Inbox & Filtering | Staff must rapidly search, sort, and slice incoming leads. | MEDIUM | Server-side text search, multi-field filters (date, source, status, assignee, location). |
| Visual Pipeline (Kanban & List) | Visual stage transitions from New Inquiry to Completed. | MEDIUM | Drag-and-drop Kanban + dense tabular view with configurable stages and terminal outcomes. |
| Follow-up Task Management | Staff must know who to contact today and what next step is required. | MEDIUM | Overdue task tracking, due date reminders, SLA escalation, daily action queue. |
| Contact & Interaction History | Complete chronological audit log of all customer touches. | MEDIUM | Consolidated timeline for calls, emails, notes, bookings, status changes. |
| Appointment Lifecycle Tracking | Tracking scheduled dates, arrivals, cancellations, and no-shows. | HIGH | Prevents double-counting, supports manual outcome entry, reconciles incoming calendar events. |
| Multi-Tenant RBAC & Security | Multiple businesses on one SaaS with strict isolation. | HIGH | Roles (Owner, Admin, Manager, Agent, Read-only) with PostgreSQL Row Level Security (RLS). |
| Conversion & Source Analytics | Owners must see ROI on ad spend and inquiry handling speed. | MEDIUM | Aggregations by source, location, staff member, conversion percentage, loss reasons. |
| CSV Data Import / Export | Migrating legacy leads and backing up contact lists. | MEDIUM | Mapping wizard, column validation, duplicate detection, failure reports. |

### Differentiators (Competitive Advantage)

Features that set Kuro Solutions CRM apart for appointment-led clinics and practices like Hoffman Audiology.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Uncertainty-Aware Conversion Tracking | Many inquiries never explicitly cancel; they simply go silent. Distinguishes confirmed lost from uncertain/stalled. | MEDIUM | Eliminates false assumptions; highlights leads needing re-engagement or closure. |
| Reconciled Unmatched Booking Queue | Booking events from external calendars/portals (e.g. MyHearingPortal) that don't match cleanly go to human review. | MEDIUM | Prevents silent data corruption and incorrect attribution. |
| Business Hours & Timezone Escalation | Follow-up SLAs calculated against business operating hours (e.g. South Africa SAST, Durban/Ballito operating schedules). | MEDIUM | Prevents overnight false alarms; accurately measures staff response velocity. |
| Modular Zero-Code Industry Templates | Pre-configured fields, stages, loss reasons, and tags for Audiology, Dental, Real Estate, Professional Services. | LOW | Allows onboarding a new vertical in minutes without source code edits. |
| Privacy-Preserving Server-Side AI | AI summaries and follow-up drafts that strictly redact medical/health identifiers and adhere to POPIA principles. | MEDIUM | Provides modern AI assistance without enterprise liability or patient privacy breaches. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create significant legal, operational, or technical problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Full EHR/EMR Clinical Charting | Healthcare practices want "one system for everything". | Massive regulatory burden (HIPAA/POPIA medical record retention, audiograms, clinical diagnosis) that derails CRM core value. | Clean integration or referral export to clinical systems (e.g., Noah, Blueprint, MyHearingPortal). |
| Autonomous AI Voice Calling Agents | "AI that calls leads automatically". | Terrible patient reception, high legal compliance risk under POPIA/TCPA, hallucinatory scheduling errors. | Daily prioritized staff call queue with click-to-call and AI-suggested talking points. |
| Unofficial WhatsApp Web Scraping | Avoids Meta business verification and per-template fees. | Accounts get banned without recourse, breaking client communications; unencrypted session storage. | Official Meta WhatsApp Business Platform Cloud API with verified templates. |
| Universal Hardcoded Workflow | Seems easier to build one fixed pipeline for all users. | Every industry and even individual practices have different conversion gates (e.g., screening vs full diagnostic). | Configurable pipeline stages, custom loss reasons, and dynamic workspace settings. |

## Feature Dependencies

```
[PostgreSQL Multi-Tenant RLS & Auth]
    └──requires──> [Workspace & Location Settings]
                       └──requires──> [Unified Contacts & Inquiries]
                                          ├──requires──> [Configurable Pipeline]
                                          ├──requires──> [Follow-up Task Queue]
                                          ├──requires──> [Integration Framework]
                                          │                  ├──webhooks──> [Website Form, Meta Ads, WhatsApp]
                                          │                  └──adapters──> [Email, Calendar, Phone Trunks]
                                          └──requires──> [Appointment Engine & Reconciliation]
                                                             └──requires──> [Attribution & Conversion Analytics]
```

### Dependency Notes

- **Multi-Tenant RLS requires Workspace & Location Settings**: Every inquiry, contact, appointment, and integration configuration is anchored to `organization_id` and optionally `location_id`.
- **Pipeline and Task Queue require Unified Inquiries**: Follow-up actions and pipeline Kanban cards represent stages of an underlying inquiry record linked to a contact.
- **Attribution Analytics requires Appointment Engine**: Conversion metrics can only be computed when inquiries are linked to terminal appointment outcomes (Completed, Cancelled, No-show).
