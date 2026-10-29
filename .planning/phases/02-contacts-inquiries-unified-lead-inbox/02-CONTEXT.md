# Phase 2: Contacts, Inquiries & Unified Lead Inbox - Context

**Gathered:** 2026-10-29
**Status:** Ready for planning
**Mode:** Auto-generated (Autonomous Mode)

<domain>
## Phase Boundary

Build the unified lead capture and data model separating long-lived Contacts from event Inquiries, complete with phone/email deduplication, TanStack Table Lead Inbox, lead merging, and CSV import/export.

Requirements covered:
- LEAD-01: Discrete Contacts and Inquiries models
- LEAD-02: Phone (E.164) and email normalization & duplicate detection
- LEAD-03: Unified Lead Inbox table with metadata, source, assignee, and next action
- LEAD-04: Server-side search and multi-field filters (source, status, assignee, date, location, tags)
- LEAD-05: Manual lead creation wizard with initial follow-up task
- LEAD-06: Side-by-side lead merge comparison modal with audit trail preservation
- LEAD-07: CSV lead import with column mapping, preview, and error reports
- LEAD-08: Authorized CSV lead export with tenant boundary protection
- LEAD-09: Contact Record view with consolidated, immutable timeline of interactions and audit logs
</domain>

<decisions>
## Implementation Decisions

### 1. Data Model (Contacts vs Inquiries vs Activities)
- `contacts`: (id, organization_id, first_name, last_name, email, phone, phone_normalized, alternate_phone, address, preferred_location_id, custom_fields JSONB, created_at, updated_at).
- `inquiries`: (id, organization_id, contact_id, location_id, assigned_user_id, source [phone, website, whatsapp, meta_ads, email, walk_in, referral], status [new, contacted, follow_up_needed, appointment_booked, completed, waiting_response, not_booked, cancelled, no_show, lost], priority [low, medium, high, urgent], loss_reason, notes, custom_fields JSONB, created_at, updated_at, last_interaction_at).
- `activities`: (id, organization_id, contact_id, inquiry_id, user_id, activity_type [note, call_logged, email_logged, whatsapp_logged, status_change, stage_moved, task_completed, appointment_scheduled, appointment_outcome, lead_merged], title, description, metadata JSONB, created_at).

### 2. Normalization & Deduplication
- Phone numbers normalized to E.164 format (e.g., South Africa `082 123 4567` → `+27821234567`).
- Emails normalized to trimmed lowercase.
- Deduplication lookup checks `phone_normalized` OR `email` within the same `organization_id`.
- If match exists, appends new inquiry to the existing contact without overwriting past interactions.

### 3. TanStack Table Lead Inbox
- Virtualized server-side pagination engineered for large datasets.
- Column definitions: Contact Name, Source (badge with icon), Preferred Clinic Location (Durban / Ballito), Status, Priority, Assigned Staff, Last Interaction, Next Action.
- Slide-over detail drawer on row click for quick actions (change status, add note, schedule appointment, log call).

### 4. Merging & CSV Tools
- Side-by-side comparison modal allowing selection of canonical primary contact while automatically re-pointing all past inquiries, activities, and tasks to the winner.
- CSV parsing via PapaParse with field mapping preview, error reporting on malformed rows, and batch ingest.
</decisions>

<code_context>
## Existing Code Insights
- Phase 1 multi-tenant schema with organizations, members, locations, and RLS policies established.
- Next.js 15 App Router, Tailwind CSS, shadcn/ui components, and RBAC helpers ready.
</code_context>

<specifics>
## Specific Deliverables
1. Migration `20261029000002_contacts_inquiries_activities.sql` with forced RLS.
2. Normalization utility `lib/deduplication/normalizer.ts`.
3. Ingestion and deduplication service `lib/services/lead-service.ts`.
4. High-performance TanStack Table Lead Inbox UI at `app/(dashboard)/[orgSlug]/inbox/page.tsx`.
5. Contact Record and Timeline view at `app/(dashboard)/[orgSlug]/contacts/[contactId]/page.tsx`.
6. Lead merge modal and CSV import/export dialogs.
7. Comprehensive unit tests covering normalization, deduplication, and lead merging.
</specifics>

<deferred>
## Deferred Ideas
- Interactive 2-way WhatsApp chat inbox inside the CRM (deferred to v2).
</deferred>
