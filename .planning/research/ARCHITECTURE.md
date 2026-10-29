# Architecture Research

**Domain:** Multi-Tenant Appointment-Led CRM SaaS
**Researched:** 2026-10-29
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Client Presentation Layer                         │
│   Next.js 15 App Router (React Server Components + TanStack Table UI)       │
│   Dashboard | Lead Inbox | Kanban Pipeline | Action Queue | Analytics      │
├─────────────────────────────────────────────────────────────────────────────┤
│                     Application & Authorization Layer                       │
│  ┌────────────────────┐  ┌────────────────────┐  ┌───────────────────────┐  │
│  │ Supabase Auth & SSR│  │ RBAC / Org Context │  │ Server Actions / Zod  │  │
│  └─────────┬──────────┘  └─────────┬──────────┘  └───────────┬───────────┘  │
│            │                       │                         │              │
├────────────┴───────────────────────┴─────────────────────────┴──────────────┤
│                         Core CRM Business Logic                             │
│  ┌───────────────────────┐  ┌──────────────────────┐  ┌──────────────────┐  │
│  │ Ingestion & Matching  │  │ Workflow Automation  │  │ Task Scheduler   │  │
│  │ (Deduplication/Merge) │  │ (Triggers/Actions)   │  │ (Due/Escalation) │  │
│  └──────────┬────────────┘  └──────────┬───────────┘  └────────┬─────────┘  │
│             │                          │                       │            │
├─────────────┴──────────────────────────┴───────────────────────┴────────────┤
│                       Modular Integration Adapters                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │ Web Form/API │  │ WhatsApp API │  │ Meta Ads API │  │ Cal / Phone /   │  │
│  │ Webhooks     │  │ Cloud API    │  │ Webhooks     │  │ Email Adapters  │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └────────┬────────┘  │
│         │                 │                 │                   │           │
├─────────┴─────────────────┴─────────────────┴───────────────────┴───────────┤
│                   Data Persistence & Isolation Layer                         │
│  PostgreSQL 16 + Row Level Security (RLS) on `organization_id`              │
│  [Organizations] [Locations] [Contacts] [Inquiries] [Tasks] [Appointments]  │
│  [Activity Logs] [Integrations] [Automation Rules] [Audit Trail]            │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Supabase Auth & Session | Validates JWTs, sets secure HTTP-only cookies, extracts user ID and organization claims. | `@supabase/ssr` middleware with server cookie store. |
| RBAC & Tenant Context | Resolves active workspace, role (Owner, Admin, Manager, Agent, Read-only), and sets RLS context. | React Server Component layout + server utility helper. |
| Ingestion & Deduplication | Ingests raw leads, sanitizes phone/email, checks for existing contacts, and links or merges. | Service module with deterministic normalization (E.164 phone, lowercase email). |
| Workflow Automation Engine | Evaluates event triggers against workspace rules and executes tasks/notifications. | Durable state machine with audit logging and idempotent execution keys. |
| Integration Framework | Manages third-party credentials, verifies incoming webhook signatures, dispatches events. | Modular adapter interface (`IntegrationAdapter`) with sandbox mocks. |
| Appointment Engine | Manages booking lifecycles, reconciles with inquiries, flags unmatched bookings for review. | Domain service with reconciliation heuristics and review queue. |
| Analytics Service | Calculates volume, response SLA, conversion percentages, loss distributions. | PostgreSQL aggregation queries with date/source/location indexing. |

## Recommended Project Structure

```
d:/CRM/
├── .planning/                  # GSD planning, research, requirements, and roadmap
├── app/                        # Next.js 15 App Router
│   ├── (auth)/                 # Public auth routes (login, register, reset, invite)
│   ├── (dashboard)/            # Authenticated CRM layout and workspace views
│   │   ├── [orgSlug]/          # Dynamic tenant workspace route
│   │   │   ├── inbox/          # Unified Lead Inbox & Detail view
│   │   │   ├── pipeline/       # Kanban & List stage views
│   │   │   ├── tasks/          # Action Queue & Overdue management
│   │   │   ├── appointments/   # Appointment calendar & review queue
│   │   │   ├── contacts/       # Contact directory & timeline
│   │   │   ├── analytics/      # Business intelligence dashboards
│   │   │   ├── automations/    # Workflow rule builder
│   │   │   ├── integrations/   # Integration setup & status cards
│   │   │   └── settings/       # Workspace, locations, team, branding
│   ├── api/                    # Public & webhook API endpoints
│   │   ├── v1/ingest/          # Inbound web lead ingestion API
│   │   └── webhooks/           # Inbound webhooks (Meta, WhatsApp, Calendars)
│   └── layout.tsx
├── components/                 # Reusable UI components
│   ├── ui/                     # shadcn/ui primitives (button, dialog, input, etc.)
│   ├── lead-inbox/             # Inbox table, filters, detail drawer, merge dialog
│   ├── pipeline/               # Kanban board, cards, stage editor
│   ├── tasks/                  # Task lists, overdue badges, action modals
│   ├── analytics/              # Metric cards, conversion funnels, charts
│   └── shared/                 # Navbar, sidebar, tenant switcher, empty states
├── lib/                        # Shared libraries and server utilities
│   ├── supabase/               # Client, server, and middleware Supabase helpers
│   ├── db/                     # Direct SQL query helpers, migrations, seeds
│   ├── integrations/           # Modular adapters (WhatsApp, Meta, Email, Phone, Calendar)
│   ├── automations/            # Trigger evaluator and action runners
│   ├── ai/                     # Groq provider abstraction and PHI redactor
│   ├── deduplication/          # Contact normalization and matching rules
│   └── utils/                  # Date helpers, formatters, error handlers
├── supabase/                   # Database migrations and seed fixtures
│   ├── migrations/             # Versioned SQL migrations (schema, RLS policies, indexes)
│   └── seed.sql                # Initial Hoffman Audiology workspace & 100k test generator
├── tests/                      # Automated test suite
│   ├── unit/                   # Vitest unit tests (dedup, validation, AI redaction)
│   ├── rls/                    # Multi-tenant cross-org security boundary tests
│   └── e2e/                    # Playwright end-to-end user workflows
├── public/                     # Static assets and brand logos
├── package.json
└── tsconfig.json
```

## Data Flow

1. **Inbound Lead Ingestion**:
   - Webhook or API request arrives at `/api/v1/ingest` or `/api/webhooks/[provider]`.
   - Security middleware validates signature, rate limit, and API key.
   - Payload is validated via Zod schema.
   - Deduplication service normalizes phone (E.164) and email, searches existing workspace contacts.
   - If contact exists: adds new Inquiry linked to contact and logs activity.
   - If new: creates Contact and Inquiry in a single database transaction.
   - Workflow Automation trigger fires (`inquiry.created`) → creates follow-up task.

2. **User Interaction in CRM**:
   - Authenticated staff logs in; active organization resolved from session.
   - PostgreSQL RLS enforces `organization_id = auth.current_org_id()`.
   - Staff views Lead Inbox or Kanban board.
   - Moving a card from "New Inquiry" to "Contacted" triggers Server Action.
   - Server Action validates permission, updates status, writes immutable activity log, and auto-completes pending initial-response task.

3. **Appointment Booking & Reconciliation**:
   - Booking event arrives from portal/calendar or manual entry.
   - Reconciliation engine matches against active inquiry for that contact.
   - If matched: marks Inquiry as "Appointment Booked", records appointment details.
   - If ambiguous/unmatched: places record in Workspace Unmatched Queue for staff review.
