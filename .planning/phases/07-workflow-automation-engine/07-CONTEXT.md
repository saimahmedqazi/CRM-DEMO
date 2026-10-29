# Phase 7 Context: Workflow Automation Engine

## Overview
Phase 7 implements the internal, durable workflow automation engine for Kuro Solutions CRM.
For clinic owners like Dr. Kara Hoffman, deterministic automation ensures leads never fall through the cracks without requiring staff to manually remember routine actions (e.g. assigning Ballito Facebook leads to the Ballito branch coordinator, immediately creating follow-up tasks for missed phone calls, or updating statuses when patients attend appointments).

## Requirements & Scope
- **AUTO-01**: Workflow schema with triggers, condition trees, and action lists with forced Row Level Security.
- **AUTO-02**: Durable rule evaluation engine with loop prevention, condition checking, and idempotent execution.
- **AUTO-03**: Pre-built clinical and commercial templates (WhatsApp auto-triage, Facebook lead routing, Missed call urgent callback, No-show recall).
- **AUTO-04**: Execution audit log with action statuses, payload snapshots, and manual re-run controls.
- **AUTO-05**: Visual Automations Dashboard UI with rule toggles, rule builder dialog, and live audit viewer.

## Architecture
- `supabase/migrations/20261029000006_workflow_automations.sql`: Schema for `automation_rules` and `automation_executions` with forced RLS.
- `lib/automations/engine.ts`: Core event dispatcher, condition evaluator, and action executor.
- `lib/automations/templates.ts`: Preloaded audiology and appointment CRM workflow templates.
- `app/(dashboard)/[orgSlug]/automations/page.tsx`: Workflow automation dashboard.
- `components/automations/rule-builder-modal.tsx`: Interactive trigger-condition-action rule creator.
- `components/automations/execution-history-table.tsx`: Execution audit log viewer.
- `tests/unit/automations.test.ts`: Vitest suite verifying rule evaluation, condition matching, action execution, and loop prevention.
