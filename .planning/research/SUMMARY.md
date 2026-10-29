# Project Research Summary

**Project:** Kuro Solutions CRM SaaS (Multi-Tenant Appointment-Led CRM)
**Domain:** Multi-Tenant Appointment-Led CRM SaaS
**Researched:** 2026-10-29
**Confidence:** HIGH

## Executive Summary

Kuro Solutions CRM is an appointment-led, multi-tenant CRM SaaS designed to solve the critical inquiry-to-appointment conversion challenge for service practices, medical/healthcare clinics, and appointment-driven SMBs. Its flagship launch workspace is Hoffman Audiology Inc., an audiology practice with clinics in Durban and Ballito, South Africa. Dr. Kara Hoffman requires centralized multi-channel inquiry capture (phone, email, WhatsApp, web forms, portal requests), deterministic follow-up tracking for unbooked inquiries, and clear conversion attribution.

To build a commercially scalable product, the system decouples client-specific configuration from the core application engine. The platform is architected around Next.js 15 App Router, React 19, TypeScript strict mode, Tailwind CSS + shadcn/ui, and PostgreSQL with Row Level Security (RLS) enforcing strict tenant boundaries. Server-side Supabase Auth handles sessions, and all third-party integrations (WhatsApp Business Cloud API, Meta Lead Ads, Calendars, Email, Phone Trunks) are isolated behind modular adapters with full test sandboxes.

Key architectural protections have been designed upfront: strict separation between long-lived `contacts` and specific event `inquiries` to eliminate data loss upon repeated inquiries; uncertainty-aware pipeline stages that prevent leads from being erroneously written off as lost; an unmatched booking review queue that prevents misattribution; and strict server-side POPIA/health information redaction before any optional Groq AI features are invoked.

## Key Findings

### Recommended Stack

A unified full-stack TypeScript architecture using Next.js 15 App Router with Server Components and Server Actions eliminates boilerplate REST plumbing while ensuring secure server-side execution. PostgreSQL provides the foundational security boundary via Row-Level Security (RLS) policies tied to the authenticated user's organization context.

**Core technologies:**
- Next.js 15 (App Router) & React 19: High-performance SSR, server actions, and route handlers.
- TypeScript (Strict): Complete type safety across database schemas, forms, and API payloads.
- PostgreSQL 16 + RLS: Database-level multi-tenant isolation, ACID consistency, and JSONB custom fields.
- Tailwind CSS & shadcn/ui: Accessible design system supporting dynamic workspace white-label branding.
- TanStack Table v8: Virtualized server-side pagination engineered to handle 100,000+ lead datasets under 200ms.
- Supabase Auth SSR: Secure HTTP-only cookies with server-side middleware session verification.
- Groq SDK: Server-side AI abstraction for optional, opt-in summarization and reply drafts.

### Expected Features

**Must have (table stakes):**
- Multi-channel inquiry ingestion (web forms, API, webhooks, CSV import).
- Fast, searchable, filterable Lead Inbox with saved views and multi-tag filtering.
- Visual Kanban pipeline and tabular list with customizable stages and terminal outcomes.
- Daily action queue for overdue follow-ups, unassigned inquiries, and SLA escalations.
- Complete chronological contact activity history and immutable staff audit trail.
- Appointment lifecycle tracking (requests, scheduled, attended, cancelled, no-show).
- Role-based access control (Owner, Admin, Manager, Agent, Read-only).
- Conversion and ROI analytics with drill-down to underlying records.

**Should have (competitive differentiators):**
- Uncertainty-aware conversion modeling (differentiating unbooked stalled leads from confirmed lost leads).
- Reconciled external booking review queue for ambiguous calendar/portal events.
- Timezone and business-hours aware follow-up rules (South Africa Standard Time SAST UTC+2).
- Dynamic industry templates (Audiology, Dental, Real Estate, Professional Services).
- Privacy-first AI assistant with automatic personal & health identifier redaction.

**Defer (v2+):**
- In-app telephony softphone WebRTC dialer (v1 supports phone event logging and trunk webhook ingestion).
- Automated SMS/WhatsApp broadcast marketing campaigns (v1 focuses on 1-to-1 inquiry follow-up).
- Native clinical chart storage / audiogram diagnostic viewing.

### Architecture Approach

The application uses a 4-tier layered architecture:
1. **Presentation**: Next.js 15 Server Components and shadcn/ui client components with TanStack Table.
2. **Authorization**: Supabase Auth SSR middleware setting tenant context and RBAC permissions.
3. **Core Domain**: Deduplication, workflow automation state machine, appointment reconciliation engine.
4. **Data Isolation**: PostgreSQL with Row-Level Security (RLS) ensuring physical isolation of tenant records.

### Critical Pitfalls

1. **Leaky Multi-Tenancy**: Prevented by enforcing PostgreSQL Row Level Security (RLS) policies at the database layer rather than relying on application code `WHERE` clauses, verified by automated cross-tenant security tests.
2. **Lead Overwrite on Subsequent Inquiries**: Prevented by modeling `contacts` and `inquiries` as distinct 1-to-many entities, preserving historic touches when a patient submits multiple inquiries.
3. **Premature Lost Lead Classification**: Prevented by introducing uncertainty states ("Follow-up Needed", "Waiting for Response") and requiring documented loss reasons for closed-lost outcomes.
4. **POPIA / Health Information Exposure**: Prevented by isolating AI calls strictly server-side, making AI opt-in per workspace, and applying automated regex/dictionary redaction of sensitive identifiers.
5. **Calendar Sync Duplication**: Prevented by unique tenant-provider constraints and an idempotent webhook event queue.

## Implications for Roadmap

Based on research findings, a 7-phase implementation roadmap is recommended:

### Phase 1: Foundation & Multi-Tenant Core Architecture
**Rationale:** Database isolation, authentication, RBAC, and workspace settings must be established and verified before any lead data is ingested.
**Delivers:** Next.js project setup, PostgreSQL schema with RLS, Supabase Auth SSR, workspace creation, multi-location support (Durban & Ballito), roles/permissions, and cross-tenant automated security tests.
**Addresses:** Multi-Tenant RBAC & Security.
**Avoids:** Leaky Multi-Tenancy (Pitfall 1).

### Phase 2: Contacts, Inquiries & Unified Lead Inbox
**Rationale:** The core data model separating contacts from inquiries is prerequisite to pipeline and follow-up tracking.
**Delivers:** Normalized contacts and inquiries schema, deduplication engine, search & filterable Lead Inbox, lead detail drawer, custom fields, tags, and CSV import/export.
**Addresses:** Multi-Channel Ingestion, Fast Lead Inbox, Contact History.
**Avoids:** Flawed Lead Deduplication and Overwrite (Pitfall 2).

### Phase 3: Configurable Pipeline & Action Queue
**Rationale:** Once inquiries are inboxed, staff need visual pipeline management and daily action items to prevent leads slipping away.
**Delivers:** Kanban board and List views, configurable stages (New Inquiry → Contacted → Follow-up Needed → Appointment Booked → Completed), loss reasons, daily task queue, overdue SLA detection, and SAST business hours scheduling.
**Addresses:** Visual Pipeline, Follow-up Task Management.
**Avoids:** False Lost Attribution (Pitfall 3).

### Phase 4: Appointment Engine & Reconciliation
**Rationale:** Appointment tracking completes the inquiry-to-appointment conversion loop and feeds analytics.
**Delivers:** Appointment booking lifecycle (requests, scheduled, attended, cancelled, no-show), outcome recording, calendar sync adapters (Google Calendar / Outlook), and the Unmatched Booking Review Queue.
**Addresses:** Appointment Lifecycle Tracking, Unmatched Booking Queue.
**Avoids:** Calendar Sync Race Conditions & Double Counting (Pitfall 5).

### Phase 5: Integration Framework & Webhooks
**Rationale:** Real-world inquiries originate from web forms, WhatsApp, Meta ads, and phone systems; these require modular adapters with test harnesses.
**Delivers:** Ingest REST API with signature verification and rate limiting, public embeddable web form, WhatsApp Business Cloud API adapter, Meta Lead Ads webhook adapter, Business Phone call-logger adapter, and integration status dashboards.
**Addresses:** Multi-Channel Ingestion, Modular Integrations.
**Avoids:** Fragile third-party coupling and vendor lock-in.

### Phase 6: Workflow Automation & Opt-In AI
**Rationale:** Automations streamline repetitive staff tasks, and AI accelerates follow-up drafting with strict privacy guards.
**Delivers:** Trigger-condition-action workflow engine, notification & task automation, server-side Groq AI provider abstraction (opt-in per workspace) with POPIA/health info redactor for follow-up suggestions and conversation summaries.
**Addresses:** Workflow Automation, Privacy-Preserving AI.
**Avoids:** PHI & Privacy Leakage (Pitfall 4).

### Phase 7: Analytics, Hardening, Hoffman Demo & Scale Verification
**Rationale:** The final phase validates conversion reporting, populates the complete Hoffman Audiology demonstration workspace, executes 100k-record load benchmarks, and completes production build verification.
**Delivers:** Business intelligence dashboard (volume, velocity, conversion rates, loss distribution, staff attribution), complete Hoffman Audiology Inc. workspace pre-configured with Durban and Ballito clinics, 100k synthetic lead benchmark, and full end-to-end test verification.
**Addresses:** Conversion & Source Analytics, Commercialization & Scale.
**Avoids:** Slow queries under enterprise load, unverified production builds.

### Phase Ordering Rationale

- Database RLS and Auth are built first so every subsequent table inherits tenant isolation.
- Contacts and Inquiries are established before Pipelines and Tasks so business workflows manipulate real entities.
- Appointments are built before Analytics because conversion metrics depend on verified appointment outcomes.
- Integrations feed into the validated Ingestion and Deduplication core.
- AI and Automations sit atop established entities rather than inventing ad-hoc abstractions.
- Synthetic load testing and Hoffman Audiology demo data validate the finished product against production requirements.

### Research Flags

- **Phase 5 (WhatsApp & Meta Webhooks):** Requires strict HMAC signature verification and sandbox fixtures to simulate Meta delivery without live ad spend.
- **Phase 6 (Groq AI & POPIA):** Requires deterministic sanitization filters so no patient names, contact info, or medical descriptions enter prompt payloads.
- **Phase 7 (100k Lead Benchmark):** Requires compound B-tree and GIN indexes on `(organization_id, status, created_at)` and full-text search columns.
