# Kuro Solutions CRM SaaS (Multi-Tenant Appointment-Led CRM)

## What This Is

A commercial-grade, multi-tenant CRM Software-as-a-Service designed for appointment-led businesses, clinics, and professional practices. It unifies inquiries across voice, email, web forms, messaging (WhatsApp), and social ads into a centralized inbox, orchestrates follow-ups and daily task queues, tracks appointment lifecycles from inquiry to confirmed outcome, and provides transparent attribution analytics. The platform launches with an initial tailored workspace for Hoffman Audiology Inc. (Durban and Ballito, South Africa) while remaining fully configurable and white-labelable across industries.

## Core Value

Capture every inbound customer inquiry across all channels, prevent leads from falling through the cracks with deterministic follow-up workflows, and deliver auditable attribution on which inquiries convert into completed appointments.

## Business Context

- **Customer**: Appointment-based SMBs, healthcare practices (audiology, dental, medical), professional service firms, and agencies; first deployment for Dr. Kara Hoffman (Hoffman Audiology Inc., Durban & Ballito, KZN, South Africa).
- **Revenue Model**: Tiered SaaS subscription per workspace (seats, locations, integrated channels, automated workflows) sold and managed by Kuro Solutions.
- **Success Metric**: Zero missed inquiries, 100% follow-up compliance within configured SLA, and verified conversion attribution from inquiry source to completed appointment.
- **Strategy Notes**: Reusable multi-tenant core with dynamic workspace schemas, industry templates, and modular integration adapters—no per-customer codebase forks.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Multi-tenant organization architecture with PostgreSQL Row Level Security (RLS) and server-side RBAC (Owner, Admin, Manager, Agent, Read-only)
- [ ] Configurable workspace settings: locations (e.g., Durban, Ballito), business hours, timezones, custom branding, and industry templates
- [ ] Unified Lead Inbox supporting search, multi-field filtering, tags, custom fields, assignment, normalized duplicate detection, and lead merging with audit trail
- [ ] Configurable Lead Pipeline with interactive Kanban and data table views, default stages (New Inquiry → Contacted → Follow-up Needed → Appointment Booked → Completed), terminal outcomes, and uncertainty indicators
- [ ] Actionable daily follow-up queue with overdue detection, escalation rules, SLA reminders, and timezone-aware business hours scheduling
- [ ] Unified Contact and Activity History timeline capturing inquiries, communications, notes, appointments, status changes, and staff audit logs
- [ ] Appointment tracking engine managing requests, scheduled dates, completions, cancellations, no-shows, conversion reconciliations, and unmatched booking review queues
- [ ] Business intelligence dashboard answering inquiry volumes, response velocity, appointment conversion rates, loss reason analysis, and staff/channel attribution
- [ ] Reusable Integration Framework featuring:
  - Public tenant-scoped web forms and authenticated ingest REST API/webhooks with signature validation and idempotency
  - Modular Email adapter (Google Workspace / Microsoft 365 OAuth architecture)
  - Official WhatsApp Business Platform Cloud API adapter with inbound webhook handling
  - Meta Lead Ads webhook ingest adapter
  - Business Phone System call-event adapter (inbound, missed calls, caller ID, appointment linking)
  - Calendar & Scheduling sync adapter (Google Calendar, Outlook, MyHearingPortal manual review queue)
  - Bulk CSV import/export with column mapping, preview, validation, and error reporting
- [ ] Durable Workflow Automation engine with triggers (inquiry created, stage changed, follow-up overdue), condition matching, and automated actions (task creation, notifications, assignments)
- [ ] Optional server-side Groq AI provider abstraction (opt-in per workspace) for next-step suggestions, follow-up drafts, and conversation summaries, with strict PHI/POPIA redaction safeguards
- [ ] Security, privacy, and compliance foundation: POPIA considerations, complete audit logging, rate limiting, CSRF/secure headers, and data export/deletion workflows
- [ ] Performance-engineered data tier tested against 100,000 synthetic leads with server-side pagination, bounded queries, and database indexing
- [ ] Initial Hoffman Audiology workspace pre-configured with Durban and Ballito locations, custom audiology intake fields, and realistic fictional demonstration leads across all inquiry channels

### Out of Scope

- Full Electronic Health Record (EHR) / Electronic Medical Record (EMR) features — The CRM is an inquiry-to-appointment conversion platform, not a clinical charting or diagnostic tool
- Autonomous outbound AI phone calling agents — Kara's stated pain point is inquiry consolidation and follow-up tracking; voice bots add regulatory and patient-trust risk without solving the core need
- WhatsApp Web scraping or unofficial client automation — Violates Meta ToS and risks account banning; only official Cloud API is supported
- Hardcoded single-tenant schemas or per-client git branches — All customer customizations must be driven by workspace configuration and database templates

## Context

- **Target Workspace 1**: Hoffman Audiology Inc., an independent practice operating in Durban (Musgrave/Morningside) and Ballito, KwaZulu-Natal. The owner, Dr. Kara Hoffman, receives inquiries from phone calls, emails, website forms, social ads, and MyHearingPortal booking requests, but lacks visibility into leads that stall before booking.
- **Deployment & Architecture**: Next.js App Router (React 19 / TypeScript strict), Tailwind CSS + shadcn/ui design system, PostgreSQL (Supabase initially with portable migrations), TanStack Table, Vitest & Playwright test suites, Docker and Vercel compatible.
- **Privacy Regulation**: South Africa's Protection of Personal Information Act (POPIA). Health-related inquiries require data minimization, strict tenant isolation, role-based redaction, and no leakage of identifiable patient info to third-party AI endpoints.

## Constraints

- **Security & Multi-Tenancy**: Tenant isolation must be strictly enforced via PostgreSQL Row-Level Security (RLS) policies based on authenticated `organization_id`, verified with automated cross-tenant penetration tests.
- **Vendor Portability**: Business logic and database schemas must use standard PostgreSQL features and clean repository/adapter abstractions to avoid vendor lock-in.
- **AI Safety**: Groq AI integration must be isolated behind a server-side provider interface, completely disabled by default, and never receive unmasked personally identifiable or health information.
- **Performance Budget**: Lead inbox and search queries must execute in < 200ms on datasets of 100,000+ records via proper B-tree/GIN indexing and server-side cursor/page pagination.
- **Integrations Reality**: When external third-party production credentials (e.g. Meta App Review, WhatsApp Business WABA, live telecom trunks) are not present, provide clean mock adapters, test harnesses, and webhook simulators alongside the production interface.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js App Router + TypeScript + Tailwind + shadcn/ui | Modern, robust, accessible UI ecosystem with server-rendered security and rich client interactions | — Pending |
| PostgreSQL with Row Level Security (RLS) | Database-level tenant boundary prevents data leakage even in the event of application logic bugs | — Pending |
| Modular Integration Adapter Architecture | Decouples third-party APIs (WhatsApp, Meta, Gmail, Calendar, Phone) from core CRM business logic | — Pending |
| Durable Internal Workflow Automation Engine | Allows customizable trigger-condition-action pipelines per workspace without fragile external automation dependencies | — Pending |
| Fictional Data Fixtures & Simulation Mode | Enables Hoffman Audiology demo and test verification without touching live patient or production external accounts | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-10-29 after initialization*
