# Phase 3: Configurable Pipeline, Follow-up Queue & Task SLAs - Context

**Gathered:** 2026-10-29
**Status:** Ready for planning
**Mode:** Auto-generated (Autonomous Mode)

<domain>
## Phase Boundary

Implement the interactive Kanban pipeline with configurable workflow stages, terminal outcomes, and loss reasons, alongside the Daily Action Queue governed by location business hours and SLA escalation.

Requirements covered:
- PIPE-01: Drag-and-drop Kanban board grouped by stage with metrics
- PIPE-02: Actionable default pipeline (New Inquiry → Contacted → Follow-up Needed → Appointment Booked → Completed)
- PIPE-03: Outcome transitions (Waiting for Response, Not Booked, Cancelled, No-show, Lost)
- PIPE-04: Uncertainty indicators distinguishing unbooked/stalled leads from confirmed lost leads
- PIPE-05: Per-workspace pipeline stage customizer (labels, order, colors)
- PIPE-06: Documented loss reason requirement upon marking Lost
- TASK-01: Daily Action Queue displaying overdue follow-ups, unassigned leads, and items due today
- TASK-02: Task management (create, assign, schedule, complete, reschedule)
- TASK-03: Timezone-aware (SAST UTC+2) business hours scheduling engine
- TASK-04: Automated SLA escalation for overdue inquiries
</domain>

<decisions>
## Implementation Decisions

### 1. Visual Pipeline (Kanban & List)
- Interactive Kanban columns representing workspace stages.
- Cards show: Contact Name, Phone, Channel Icon, Time in Stage, SLA status badge (On Track, Approaching SLA, Overdue SLA), and clinic location tag.
- Drag-and-drop triggers server action to update inquiry status and log activity.
- Stalled / uncertain leads highlighted with a distinct visual indicator ("Stalled / Needs Follow-up") rather than treating them as Lost.

### 2. Follow-up Tasks & SLA Calculation
- `tasks` table: (id, organization_id, contact_id, inquiry_id, assigned_user_id, title, description, task_type [initial_response, follow_up_call, send_quote, recall, appointment_confirmation], due_at, completed_at, is_completed, priority, created_at).
- SLA Calculator (`lib/sla/sla-calculator.ts`):
  Evaluates location operating hours (e.g. Durban 08:00 - 16:30 SAST).
  Inquiries received after hours roll over to the next business day 08:00 before SLA countdown starts.
  SLA thresholds: Initial response within 2 business hours; Follow-up within 24 business hours.
  Inquiries breaching SLA are automatically flagged with `is_escalated: true` and surfaced at the top of the Action Queue.

### 3. Daily Action Queue UI
- Purpose-built dashboard (`/[orgSlug]/tasks`) presenting:
  - Overdue Section (Red alert counter, high priority)
  - Due Today Section (Prioritized by urgency and clinic location)
  - Unassigned Leads Section (One-click claim or assign)
  - Quick task completion with 1-click outcome note
</decisions>

<code_context>
## Existing Code Insights
- Phase 1 multi-tenant foundation & Phase 2 contacts and inquiries established.
- `leadService` contains inquiries in various stages with demo records.
</code_context>

<specifics>
## Specific Deliverables
1. Migration `20261029000003_tasks_and_pipeline_stages.sql` with forced RLS.
2. SAST Business Hours SLA calculator `lib/sla/sla-calculator.ts`.
3. Task management service `lib/services/task-service.ts`.
4. Kanban Board UI at `app/(dashboard)/[orgSlug]/pipeline/page.tsx`.
5. Action Queue UI at `app/(dashboard)/[orgSlug]/tasks/page.tsx`.
6. Unit tests verifying SLA calculation, business hours rollover, and task state transitions.
</specifics>

<deferred>
## Deferred Ideas
- Automated SMS/WhatsApp scheduled broadcast reminders (deferred to v2).
</deferred>
