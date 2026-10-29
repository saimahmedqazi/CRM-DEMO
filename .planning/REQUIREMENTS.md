# Requirements: Kuro Solutions CRM SaaS

**Defined:** 2026-10-29
**Core Value:** Capture every inbound customer inquiry across all channels, prevent leads from falling through the cracks with deterministic follow-up workflows, and deliver auditable attribution on which inquiries convert into completed appointments.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Authentication & Multi-Tenancy (AUTH)

- [x] **AUTH-01**: User can create an account, log in securely with email and password, and maintain a persistent server-validated session across page refreshes.
- [x] **AUTH-02**: User can create a new organization/workspace or join an existing organization via an invitation token.
- [x] **AUTH-03**: Administrator can assign and modify user roles within a workspace (Owner, Administrator, Manager, Agent, Read-only).
- [x] **AUTH-04**: Database strictly enforces tenant separation on all tenant-owned records using PostgreSQL Row Level Security (RLS) based on the authenticated session's organization.
- [x] **AUTH-05**: Automated security tests prove a user in Organization A cannot read, update, delete, or export records belonging to Organization B via direct queries or manipulated identifiers.

### Workspace Configuration & Locations (WORK)

- [x] **WORK-01**: Administrator can configure workspace general profile (name, logo, timezone, currency, and white-label theme colors).
- [x] **WORK-02**: Administrator can manage multiple business locations within a single workspace (e.g., Hoffman Audiology's Durban and Ballito clinics).
- [x] **WORK-03**: Administrator can define business operating hours per location to govern SLA calculation and follow-up deadlines.
- [x] **WORK-04**: Administrator can select and apply pre-configured industry templates (Audiology, Dental, Real Estate, Professional Services) that seed specialized fields, tags, stages, and loss reasons.

### Contacts, Inquiries & Lead Inbox (LEAD)

- [x] **LEAD-01**: System maintains distinct models for Contacts (the individual person) and Inquiries (a specific event/interest request) to preserve historical data across multiple interactions.
- [x] **LEAD-02**: System automatically normalizes contact phone numbers (E.164) and email addresses upon ingestion to detect duplicates within the workspace.
- [x] **LEAD-03**: User can view a unified Lead Inbox table displaying inquiry source, contact details, assigned owner, status, priority, creation date, last interaction, and next scheduled action.
- [x] **LEAD-04**: User can perform instant server-side text search across contacts and inquiries and apply multi-criteria filters (source, status, assignee, date range, location, tags).
- [x] **LEAD-05**: User can manually create a new lead with contact information, inquiry source, tags, custom fields, and an initial follow-up task.
- [x] **LEAD-06**: User can merge duplicate leads with a side-by-side comparison modal while preserving all historical notes, appointments, and interaction logs.
- [x] **LEAD-07**: User can import leads via CSV with column mapping, data validation, duplicate resolution preview, and downloadable error reports.
- [x] **LEAD-08**: User can export filtered lead lists to CSV with verified tenant-bounded authorization.
- [x] **LEAD-09**: User can open a Contact Record showing an immutable, consolidated timeline of all calls, emails, notes, appointments, status changes, and staff audit logs.

### Configurable Pipeline (PIPE)

- [ ] **PIPE-01**: User can view inquiries on an interactive drag-and-drop Kanban board grouped by stage with column totals and summary metrics.
- [ ] **PIPE-02**: Workspace ships with an actionable default pipeline: New Inquiry → Contacted → Follow-up Needed → Appointment Booked → Completed.
- [ ] **PIPE-03**: User can transition inquiries into intermediate or terminal outcome states (Waiting for Response, Not Booked, Cancelled, No-show, Lost).
- [ ] **PIPE-04**: System visually distinguishes unbooked/stalled inquiries with uncertain outcomes from confirmed lost leads.
- [ ] **PIPE-05**: Administrator can customize pipeline stages, stage order, stage labels, and required fields per workspace.
- [ ] **PIPE-06**: User must record a documented loss reason when marking an inquiry as Lost (e.g., Price Objection, Out of Area, Competitor, Unresponsive).

### Follow-up & Task Queue (TASK)

- [ ] **TASK-01**: System displays a dedicated Daily Action Queue showing overdue follow-ups, inquiries awaiting initial response, unassigned leads, and items needing attention today.
- [ ] **TASK-02**: User can create, assign, schedule, complete, and reschedule follow-up tasks linked directly to an inquiry or contact.
- [ ] **TASK-03**: System calculates follow-up due dates and overdue statuses using the workspace's configured timezone and location business hours.
- [ ] **TASK-04**: System automatically escalates or flags inquiries that exceed the configured response time SLA without an interaction.

### Appointment Tracking & Reconciliation (APPT)

- [ ] **APPT-01**: User can log appointment requests, scheduled appointments, attendances/completions, cancellations, and no-shows linked to an inquiry.
- [ ] **APPT-02**: User can record the outcome of an appointment (e.g., Completed - Hearing Aid Fitted, Completed - Follow-up Advised, No-show, Cancelled).
- [ ] **APPT-03**: System supports an integration adapter with calendar systems (Google Calendar / Microsoft Outlook) and booking portals.
- [ ] **APPT-04**: Incoming booking events are automatically reconciled with existing active inquiries for that contact using idempotent matching.
- [ ] **APPT-05**: System routes ambiguous or unmatched external booking events to an Unmatched Booking Review Queue for manual staff verification.

### Analytics & Attribution (ANLY)

- [ ] **ANLY-01**: Dashboard displays executive KPI cards: total inquiries, response velocity (time-to-first-contact), appointment booking conversion rate, completed appointment rate, and open follow-up count.
- [ ] **ANLY-02**: Dashboard provides source attribution charts comparing inquiry volume and booking conversion percentage across channels (Phone, Website Form, WhatsApp, Meta Ads, Email, Direct).
- [ ] **ANLY-03**: Dashboard provides a conversion funnel visualization tracking drop-offs from New Inquiry down to Completed Appointment.
- [ ] **ANLY-04**: Dashboard reports loss reason distributions to help practice owners identify why unbooked inquiries failed to convert.
- [ ] **ANLY-05**: User can filter analytics by date range, business location (e.g., Durban vs Ballito), inquiry source, and assigned team member.
- [ ] **ANLY-06**: User can click on any metric in the analytics dashboard to open the list of underlying records supporting that number.

### Integration Framework & Webhooks (INTG)

- [ ] **INTG-01**: System provides an embeddable public website lead capture form with server-side validation, rate limiting, Honeypot spam protection, and tenant attribution.
- [ ] **INTG-02**: System provides a documented, authenticated inbound REST API (`/api/v1/ingest`) for external website lead capture with API keys and tenant isolation.
- [ ] **INTG-03**: System provides an authenticated webhook receiver with HMAC signature verification, replay attack prevention, and idempotent event processing.
- [ ] **INTG-04**: System includes an official Meta WhatsApp Business Cloud API adapter supporting inbound inquiry capture, contact matching, and webhook delivery.
- [ ] **INTG-05**: System includes a Meta Lead Ads webhook ingest adapter for Facebook and Instagram advertising leads.
- [ ] **INTG-06**: System includes an Email adapter architecture (Google Workspace / Microsoft 365 OAuth & IMAP/SMTP) to record inbound email inquiries.
- [ ] **INTG-07**: System includes a Business Phone call-logger adapter to capture inbound call events, caller phone numbers, timestamps, and missed-call notifications.
- [ ] **INTG-08**: System displays an Integrations Hub showing connection status, last sync timestamp, health indicators, configuration modal, and sandbox simulation tools for unconfigured external providers.

### Workflow Automation (AUTO)

- [ ] **AUTO-01**: Administrator can configure automation rules composed of Triggers, Conditions, and Actions.
- [ ] **AUTO-02**: Supported triggers include: New Inquiry Created, Inquiry Status Changed, Follow-up Overdue, Appointment Scheduled, and Inbound Webhook Received.
- [ ] **AUTO-03**: Supported conditions include: Source, Location, Current Status, Assigned Owner, Tags, and Time Elapsed.
- [ ] **AUTO-04**: Supported actions include: Create Follow-up Task, Assign Team Member, Update Status, Send Internal Notification, and Apply Tags.
- [ ] **AUTO-05**: System logs automation execution history with execution status (Success, Failed, Retried) and idempotency keys to prevent duplicate actions.

### AI Features & Privacy Protection (AI)

- [ ] **AI-01**: System provides an opt-in, server-side AI provider abstraction powered by Groq API, isolated so the CRM operates fully with AI disabled.
- [ ] **AI-02**: AI service provides suggested next actions and follow-up message drafts for human review.
- [ ] **AI-03**: AI service provides concise summaries of contact interaction histories to prepare staff before calls.
- [ ] **AI-04**: System enforces strict client/server privacy filters that automatically scrub personal identifiable information (PII) and protected health information (PHI) before dispatching prompts to external LLMs.
- [ ] **AI-05**: AI suggestions are visually labeled as AI-generated and require human staff approval before any message or status change is applied.

### Security, Performance & Demonstration Workspace (SEC)

- [ ] **SEC-01**: System implements comprehensive audit logging for sensitive staff actions (record views, updates, deletes, role modifications, exports).
- [ ] **SEC-02**: System enforces secure HTTP headers, CSRF protections, and strict input validation via Zod on all endpoints.
- [ ] **SEC-03**: System supports GDPR/POPIA compliance features including complete tenant data export and right-to-be-forgotten deletion workflows.
- [ ] **SEC-04**: Database queries, indexes, and TanStack Table virtual pagination are benchmarked and verified against 100,000 synthetic leads with sub-200ms query performance.
- [ ] **SEC-05**: System ships with a fully configured Hoffman Audiology Inc. demonstration workspace featuring Durban and Ballito clinics and realistic fictional test data across all inquiry channels.

## v2 Requirements

Deferred to future releases.

### Advanced Communications (COMM-v2)
- **COMM-01**: In-browser WebRTC softphone dialer with call recording and playback.
- **COMM-02**: Two-way interactive WhatsApp conversation chat window inside the CRM inbox.
- **COMM-03**: Automated SMS/WhatsApp appointment reminders with interactive confirmation buttons.

### Billing & Subscription Management (BILL-v2)
- **BILL-01**: Self-service Stripe / PayFast subscription billing portal for Kuro Solutions customers.
- **BILL-02**: Automated seat and location quota enforcement with credit card upgrade flows.

### Advanced Practice Management (PM-v2)
- **PM-01**: Direct bilateral synchronization with Noah hearing aid diagnostic database.
- **PM-02**: Multi-calendar room and equipment scheduling resource manager.

## Out of Scope

Explicitly excluded to maintain commercial focus and regulatory safety.

| Feature | Reason |
|---------|--------|
| Electronic Medical Record (EMR) / Clinical Notes | Kuro Solutions CRM is an inquiry-to-appointment conversion engine, not a certified clinical EHR. Clinical diagnoses belong in medical records. |
| Autonomous AI Voice Calling Outbound Bots | Unreliable voice bots create severe patient trust issues and legal risks under South Africa's POPIA and global calling regulations. |
| Unofficial WhatsApp Web Scraping | High account ban risk, unencrypted credential storage, and violation of Meta Terms of Service. Only official Cloud API is supported. |
| Hardcoded Single-Tenant Codebases | Hoffman Audiology is the first customer workspace on a reusable multi-tenant architecture. Code forks per customer are prohibited. |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Completed |
| AUTH-02 | Phase 1 | Completed |
| AUTH-03 | Phase 1 | Completed |
| AUTH-04 | Phase 1 | Completed |
| AUTH-05 | Phase 1 | Completed |
| WORK-01 | Phase 1 | Completed |
| WORK-02 | Phase 1 | Completed |
| WORK-03 | Phase 1 | Completed |
| WORK-04 | Phase 1 | Completed |
| LEAD-01 | Phase 2 | Completed |
| LEAD-02 | Phase 2 | Completed |
| LEAD-03 | Phase 2 | Completed |
| LEAD-04 | Phase 2 | Completed |
| LEAD-05 | Phase 2 | Completed |
| LEAD-06 | Phase 2 | Completed |
| LEAD-07 | Phase 2 | Completed |
| LEAD-08 | Phase 2 | Completed |
| LEAD-09 | Phase 2 | Completed |
| PIPE-01 | Phase 3 | Completed |
| PIPE-02 | Phase 3 | Completed |
| PIPE-03 | Phase 3 | Completed |
| PIPE-04 | Phase 3 | Completed |
| PIPE-05 | Phase 3 | Completed |
| PIPE-06 | Phase 3 | Completed |
| TASK-01 | Phase 3 | Completed |
| TASK-02 | Phase 3 | Completed |
| TASK-03 | Phase 3 | Completed |
| TASK-04 | Phase 3 | Completed |
| APPT-01 | Phase 4 | Completed |
| APPT-02 | Phase 4 | Completed |
| APPT-03 | Phase 4 | Completed |
| APPT-04 | Phase 4 | Completed |
| APPT-05 | Phase 4 | Completed |
| ANLY-01 | Phase 5 | Completed |
| ANLY-02 | Phase 5 | Completed |
| ANLY-03 | Phase 5 | Completed |
| ANLY-04 | Phase 5 | Completed |
| ANLY-05 | Phase 5 | Completed |
| ANLY-06 | Phase 5 | Completed |
| INTG-01 | Phase 6 | Completed |
| INTG-02 | Phase 6 | Completed |
| INTG-03 | Phase 6 | Completed |
| INTG-04 | Phase 6 | Completed |
| INTG-05 | Phase 6 | Completed |
| INTG-06 | Phase 6 | Completed |
| INTG-07 | Phase 6 | Completed |
| INTG-08 | Phase 6 | Completed |
| AUTO-01 | Phase 7 | Completed |
| AUTO-02 | Phase 7 | Completed |
| AUTO-03 | Phase 7 | Completed |
| AUTO-04 | Phase 7 | Completed |
| AUTO-05 | Phase 7 | Completed |
| AI-01 | Phase 8 | Pending |
| AI-02 | Phase 8 | Pending |
| AI-03 | Phase 8 | Pending |
| AI-04 | Phase 8 | Pending |
| AI-05 | Phase 8 | Pending |
| SEC-01 | Phase 8 | Pending |
| SEC-02 | Phase 8 | Pending |
| SEC-03 | Phase 8 | Pending |
| SEC-04 | Phase 8 | Pending |
| SEC-05 | Phase 8 | Pending |

**Coverage:**
- v1 requirements: 60 total
- Mapped to phases: 60
- Unmapped: 0 ✓

---
*Requirements defined: 2026-10-29*
*Last updated: 2026-10-29 after initialization*
