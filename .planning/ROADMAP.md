# Roadmap: Kuro Solutions CRM SaaS (Multi-Tenant Appointment-Led CRM)

## Overview

This roadmap defines the end-to-end engineering lifecycle for delivering a commercial-grade, multi-tenant CRM SaaS designed for appointment-led businesses, with an initial tailored launch workspace for Hoffman Audiology Inc. (Durban and Ballito, South Africa). The journey advances from database isolation and multi-tenancy, through unified lead management, pipeline workflows, appointment reconciliation, business intelligence analytics, modular integrations, and automation, culminating in privacy-guarded AI, security hardening, and a 100,000-record scale benchmark.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 1: Foundation & Multi-Tenant Core Architecture** - Next.js 15, PostgreSQL RLS, Supabase Auth SSR, workspace creation, multi-location support, and cross-tenant security verification
- [x] **Phase 2: Contacts, Inquiries & Unified Lead Inbox** - Unified data model, E.164/email deduplication, TanStack Table Lead Inbox, lead merging, and CSV import/export
- [ ] **Phase 3: Configurable Pipeline, Follow-up Queue & Task SLAs** - Drag-and-drop Kanban, uncertainty-aware stage transitions, loss reasons, daily action queue, and SAST business hours scheduling
- [ ] **Phase 4: Appointment Lifecycle & Reconciliation Engine** - Appointment scheduling, attendance outcomes, calendar adapters (Google/Outlook), and unmatched booking review queue
- [ ] **Phase 5: Conversion & Source Attribution Analytics** - Executive KPI metrics, multi-channel attribution, drop-off funnel, loss distribution, and underlying record drill-downs
- [ ] **Phase 6: Reusable Integration Framework & Webhooks** - Public website lead capture form, authenticated REST ingest API, HMAC webhooks, WhatsApp Cloud API, Meta Ads, and Phone call-logger adapters
- [ ] **Phase 7: Workflow Automation Engine** - Durable trigger-condition-action engine, automatic task creation, notification dispatch, and execution audit history
- [ ] **Phase 8: AI Privacy Guard, Hardening, Hoffman Demo & Scale Verification** - Server-side Groq AI with POPIA/health info redactor, security hardening, Hoffman Audiology demonstration workspace, and 100,000-lead benchmark

## Phase Details

### Phase 1: Foundation & Multi-Tenant Core Architecture
**Goal**: Establish the full-stack project architecture with strictly enforced PostgreSQL Row-Level Security (RLS), server-side authentication, workspace management, multi-location support (Durban & Ballito), and automated tenant isolation tests.
**Mode**: mvp
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, WORK-01, WORK-02, WORK-03, WORK-04
**Success Criteria** (what must be TRUE):
  1. User can register, authenticate via secure HTTP-only cookies, and access their assigned workspace with appropriate RBAC permissions.
  2. Database enforces Row-Level Security (RLS) such that direct SQL queries across different `organization_id` partitions are blocked at the engine level.
  3. Administrator can manage workspace profile, add multiple locations (Durban and Ballito), configure location business hours, and select industry templates.
  4. Automated security test suite verifies that cross-tenant read, write, update, and delete operations fail definitively.
**Plans**: 3 plans

Plans:
- [x] 01-01: Next.js 15 App Router scaffold, Tailwind CSS + shadcn/ui design tokens, and environment validation.
- [x] 01-02: PostgreSQL database schema migrations with RLS policies, Supabase Auth SSR session handling, and RBAC middleware.
- [x] 01-03: Workspace & location settings UI, industry template loader, and automated cross-tenant security test suite.

### Phase 2: Contacts, Inquiries & Unified Lead Inbox
**Goal**: Build the unified lead capture and data model separating long-lived Contacts from event Inquiries, complete with phone/email deduplication, TanStack Table Lead Inbox, lead merging, and CSV import/export.
**Mode**: mvp
**Depends on**: Phase 1
**Requirements**: LEAD-01, LEAD-02, LEAD-03, LEAD-04, LEAD-05, LEAD-06, LEAD-07, LEAD-08, LEAD-09
**Success Criteria** (what must be TRUE):
  1. Contacts and Inquiries are persisted as distinct entities; subsequent inquiries from the same contact append to contact history rather than overwriting past data.
  2. Incoming inquiries automatically normalize phone numbers to E.164 and emails to lowercase for workspace deduplication.
  3. User can search, sort, and filter the Lead Inbox with instant server-side responses across thousands of leads.
  4. User can manually create leads, merge duplicate records with an audit trail, and import/export leads via validated CSV.
  5. Contact record displays an immutable, consolidated timeline of all inquiries, notes, calls, and staff updates.
**Plans**: 3 plans

Plans:
- [x] 02-01: Contacts and Inquiries schema, E.164 normalization, deduplication engine, and lead creation actions.
- [x] 02-02: High-performance TanStack Table Lead Inbox with server-side multi-filter, search, and detail drawer.
- [x] 02-03: Lead merge comparison wizard, CSV import/export with schema mapping, and contact activity timeline.

### Phase 3: Configurable Pipeline, Follow-up Queue & Task SLAs
**Goal**: Implement the visual Kanban pipeline with configurable stages and loss reasons, alongside the Daily Action Queue governed by location business hours and SLA escalation.
**Mode**: mvp
**Depends on**: Phase 2
**Requirements**: PIPE-01, PIPE-02, PIPE-03, PIPE-04, PIPE-05, PIPE-06, TASK-01, TASK-02, TASK-03, TASK-04
**Success Criteria** (what must be TRUE):
  1. User can drag and drop leads between pipeline stages with optimistic UI updates and server validation.
  2. Inquiries with unconfirmed outcomes are visually marked with uncertainty states rather than prematurely categorized as lost.
  3. Moving an inquiry to Lost requires selecting or inputting a structured loss reason.
  4. Daily Action Queue lists overdue follow-ups and unassigned inquiries calculated using the location's specific business hours and timezone (SAST UTC+2).
  5. Inquiries breaching response SLAs trigger visual escalation badges and auto-created high-priority follow-up tasks.
**Plans**: 3 plans

Plans:
- [x] 03-01: Configurable pipeline schema, stage transitions, loss reason modals, and drag-and-drop Kanban view.
- [x] 03-02: Daily Action Queue UI, task assignment, due date scheduling, and status completion actions.
- [x] 03-03: Business hours SLA calculation engine and overdue follow-up escalation monitors.

### Phase 4: Appointment Lifecycle & Reconciliation Engine
**Goal**: Build the appointment scheduling and attendance tracking system with calendar integration adapters and an Unmatched Booking Review Queue to eliminate misattribution and double counting.
**Mode**: mvp
**Depends on**: Phase 3
**Requirements**: APPT-01, APPT-02, APPT-03, APPT-04, APPT-05
**Success Criteria** (what must be TRUE):
  1. User can schedule, reschedule, cancel, and mark appointments as completed or no-show directly from the lead view.
  2. Appointment outcomes (e.g. Hearing Aid Fitted, Assessment Completed) are recorded and reflected in the inquiry status.
  3. Calendar integration adapter syncs events with Google Calendar and Outlook using idempotent unique keys.
  4. Incoming booking events match existing active inquiries; ambiguous bookings are cleanly routed to the Unmatched Booking Review Queue.
**Plans**: 2 plans

Plans:
- [x] 04-01: Appointment data model, lifecycle state machine, and scheduling UI with outcome logging.
- [x] 04-02: Calendar synchronization adapters, idempotent event reconciliation, and the Unmatched Booking Review Queue.

### Phase 5: Conversion & Source Attribution Analytics
**Goal**: Deliver actionable business intelligence dashboards answering executive questions on inquiry volume, response velocity, appointment conversion rates, channel attribution, and loss analysis.
**Mode**: mvp
**Depends on**: Phase 4
**Requirements**: ANLY-01, ANLY-02, ANLY-03, ANLY-04, ANLY-05, ANLY-06
**Success Criteria** (what must be TRUE):
  1. Dashboard displays core KPIs: total inquiries, average time-to-first-contact, booking conversion %, and completed appointment conversion %.
  2. Source attribution charts accurately show volume and conversion rates across Phone, Web Form, WhatsApp, Meta Ads, and Email.
  3. Funnel chart visualizes drop-offs from New Inquiry to Completed Appointment with filter support for Durban vs Ballito locations.
  4. Loss reason breakdown pinpoints top drivers of lost opportunities.
  5. Clicking on any chart or metric card opens a filtered drill-down of the underlying lead records.
**Plans**: 2 plans

Plans:
- [x] 05-01: High-performance PostgreSQL aggregation queries and analytics service layer with date/location/source filtering.
- [x] 05-02: Interactive analytics dashboard UI with KPI metric cards, conversion funnel, source attribution, and drill-down modals.

### Phase 6: Reusable Integration Framework & Webhooks
**Goal**: Provide a pluggable integration engine featuring public website forms, an authenticated ingest REST API, HMAC webhook handling, and adapters for WhatsApp, Meta Ads, Email, and Phone systems.
**Mode**: mvp
**Depends on**: Phase 5
**Requirements**: INTG-01, INTG-02, INTG-03, INTG-04, INTG-05, INTG-06, INTG-07, INTG-08
**Success Criteria** (what must be TRUE):
  1. Public website lead capture form successfully validates input, blocks spam via honeypot, and creates CRM leads with attribution.
  2. Authenticated REST API (`/api/v1/ingest`) creates leads using tenant API keys with rate limiting and signature validation.
  3. Webhook listener verifies HMAC signatures and prevents replay attacks using an idempotent event log.
  4. Modular adapters for WhatsApp Business Cloud API, Meta Lead Ads, Email, and Phone call logs process payloads into CRM inquiries.
  5. Integrations Hub displays real-time connection status, sync logs, and an interactive sandbox simulator for credentials-free testing.
**Plans**: 3 plans

Plans:
- [ ] 06-01: Public embeddable web form and authenticated REST ingest API with API key authentication and rate limiting.
- [ ] 06-02: Webhook security layer (HMAC verification, idempotency) and Meta Lead Ads / WhatsApp Cloud API adapters.
- [ ] 06-03: Email and Business Phone call-logger adapters with the Integrations Hub management dashboard and sandbox simulator.

### Phase 7: Workflow Automation Engine
**Goal**: Build an internal, durable workflow automation engine that evaluates configurable triggers and conditions to execute automated tasks, assignments, status changes, and notifications.
**Mode**: mvp
**Depends on**: Phase 6
**Requirements**: AUTO-01, AUTO-02, AUTO-03, AUTO-04, AUTO-05
**Success Criteria** (what must be TRUE):
  1. Administrator can build automation rules using a visual trigger-condition-action interface.
  2. Events (new inquiry created, stage moved, follow-up overdue, booking logged) trigger automated rule evaluation immediately.
  3. Conditions (source, location, status, tags, age) filter execution deterministically.
  4. Actions (create follow-up task, assign owner, update status, send internal notification) execute with idempotency and error logging.
  5. Audit log displays execution history with retry controls for failed actions.
**Plans**: 2 plans

Plans:
- [ ] 07-01: Automation rule engine, trigger listeners, condition evaluator, and action execution dispatcher.
- [ ] 07-02: Workflow builder UI, template presets, execution audit logs, and test run simulator.

### Phase 8: AI Privacy Guard, Hardening, Hoffman Demo & Scale Verification
**Goal**: Integrate server-side Groq AI with automated POPIA/health information redaction, enforce security hardening, seed the complete Hoffman Audiology demonstration workspace, and benchmark against 100,000 leads.
**Mode**: mvp
**Depends on**: Phase 7
**Requirements**: AI-01, AI-02, AI-03, AI-04, AI-05, SEC-01, SEC-02, SEC-03, SEC-04, SEC-05
**Success Criteria** (what must be TRUE):
  1. Groq AI integration operates strictly server-side, is opt-in per workspace, and gracefully falls back when disabled or out of quota.
  2. Privacy filter scrubs patient names, phone numbers, emails, and medical keywords before prompts are sent to external LLMs.
  3. System provides AI-assisted follow-up message drafts, next-action suggestions, and interaction summaries with explicit human approval gates.
  4. Audit logging, CSRF protection, secure headers, and POPIA data export/delete workflows are operational and tested.
  5. System generates 100,000 synthetic leads; database queries and TanStack Table virtual pagination maintain sub-200ms latency.
  6. Hoffman Audiology Inc. workspace is fully populated with Durban and Ballito clinics, custom audiology fields, and realistic multi-channel demonstration leads.
**Plans**: 3 plans

Plans:
- [ ] 08-01: Server-side Groq AI provider abstraction with POPIA PII/PHI redaction filter and UI drafting tools.
- [ ] 08-02: Security hardening (audit trail, secure headers, rate limits, POPIA export/deletion).
- [ ] 08-03: 100k-record performance benchmark suite, Hoffman Audiology demonstration seed dataset, and production build verification.

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Multi-Tenant Core Architecture | 3/3 | Completed | 2026-10-29 |
| 2. Contacts, Inquiries & Unified Lead Inbox | 3/3 | Completed | 2026-10-29 |
| 3. Configurable Pipeline, Follow-up Queue & Task SLAs | 0/3 | Not started | - |
| 4. Appointment Lifecycle & Reconciliation Engine | 0/2 | Not started | - |
| 5. Conversion & Source Attribution Analytics | 0/2 | Not started | - |
| 6. Reusable Integration Framework & Webhooks | 0/3 | Not started | - |
| 7. Workflow Automation Engine | 0/2 | Not started | - |
| 8. AI Privacy Guard, Hardening, Hoffman Demo & Scale Verification | 0/3 | Not started | - |

---
*Roadmap generated: 2026-10-29*
*Status: Ready for execution*
