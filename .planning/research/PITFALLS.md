# Pitfalls Research

**Domain:** Multi-Tenant Appointment-Led CRM SaaS
**Researched:** 2026-10-29
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: Leaky Multi-Tenancy (Application-Only Filtering)

**What goes wrong:**
Developers rely on application-level filtering (e.g., `WHERE org_id = req.user.org_id`) in queries. A single forgotten `WHERE` clause in a search route, export handler, or background job exposes one practice's patient leads to another practice.

**Why it happens:**
Writing `org_id` into every ORM query manually is prone to human error, especially in complex joins, nested relationships, and bulk exports.

**How to avoid:**
Enforce tenant boundaries in the database engine using PostgreSQL Row Level Security (RLS) on all tenant tables (`contacts`, `inquiries`, `tasks`, `appointments`, `activity_logs`). Back this with automated multi-tenant penetration tests attempting cross-tenant reads and updates via direct API calls.

**Warning signs:**
Direct queries succeed without an active tenant context; RLS is disabled on any table with an `organization_id` column.

**Phase to address:**
Phase 1 (Core Foundation & Multi-Tenant Database).

---

### Pitfall 2: Flawed Lead Deduplication and Overwrite

**What goes wrong:**
When a returning customer calls or submits a new form, the CRM either blindly overwrites the existing contact (wiping out historical notes and past appointment records) or creates a duplicate contact, fragmenting the customer's history.

**Why it happens:**
Treating "Contact" (the human being) and "Inquiry" (the specific event/request) as a single database table.

**How to avoid:**
Separate `contacts` (normalized phone, email, name) from `inquiries` (source, campaign, status, message, timestamp). When a new inquiry arrives with matching normalized contact details, append the inquiry to the existing contact, update `last_interaction_at`, and preserve all historical interactions.

**Warning signs:**
Customer complains that past appointment records disappeared after submitting a new website inquiry.

**Phase to address:**
Phase 2 (Contacts, Inquiries & Lead Inbox).

---

### Pitfall 3: False Lost Attribution (Treating Stalled Leads as Definitively Lost)

**What goes wrong:**
The CRM automatically flags any inquiry that hasn't booked within 3 days as "Lost". This skews conversion analytics, demoralizes staff, and causes practices to stop following up on high-value potential patients.

**Why it happens:**
Over-simplified binary status modeling (Booked vs Lost) with no intermediate "Uncertain", "Waiting for Response", or "Follow-up Needed" states.

**How to avoid:**
Support explicit workflow stages with uncertainty tracking. An unbooked inquiry remains in "Follow-up Needed" or "Waiting for Response" until staff actively mark it as lost with a documented reason (e.g., "Price objection", "Out of area", "Purchased elsewhere") or an inactivity threshold archives it with an "Unresolved" tag rather than a false loss.

**Warning signs:**
Conversion reports show 80% loss rate for leads that are actually still communicating via WhatsApp.

**Phase to address:**
Phase 3 (Pipelines, Follow-ups & Task Queue).

---

### Pitfall 4: PHI & Privacy Leakage into Public / AI Services

**What goes wrong:**
Healthcare inquiry text (e.g., "Dr. Hoffman, I have tinnitus in my left ear and need a hearing aid fitting") gets sent in plaintext to external public AI endpoints, violating South Africa's POPIA and medical confidentiality rules.

**Why it happens:**
Calling external AI APIs directly from client code or feeding raw database records without privacy scrubbers.

**How to avoid:**
1. AI integration is server-side only and strictly opt-in per workspace.
2. An automated redaction filter scrubs names, phone numbers, email addresses, and South African ID numbers before any prompt is assembled.
3. For audiology/healthcare workspaces, AI is constrained to generating generic response templates and administrative task categorization.

**Warning signs:**
API request logs to Groq/external LLMs contain patient phone numbers or clinical descriptions.

**Phase to address:**
Phase 6 (AI Features, Security, Privacy & Compliance).

---

### Pitfall 5: Calendar Sync Race Conditions & Double Counting

**What goes wrong:**
When an external booking system (e.g., Google Calendar, MyHearingPortal) syncs appointments, webhook retries or race conditions create duplicate appointment rows, inflating conversion counts and double-booking staff slots.

**Why it happens:**
Lack of idempotency keys and absence of unique constraints on `(organization_id, external_booking_id)`.

**How to avoid:**
1. Enforce unique external identifiers per tenant: `UNIQUE (organization_id, external_provider, external_id)`.
2. Implement idempotent webhook ingestion using a processed-events deduplication table.
3. Route ambiguous bookings (where contact cannot be matched with 100% confidence) to an Unmatched Review Queue rather than guessing.

**Warning signs:**
Dashboard reports more completed appointments than patients seen; multiple booking cards for the same time slot.

**Phase to address:**
Phase 4 (Appointment Tracking & Reconciliation).
