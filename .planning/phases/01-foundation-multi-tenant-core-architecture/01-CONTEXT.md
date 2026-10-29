# Phase 1: Foundation & Multi-Tenant Core Architecture - Context

**Gathered:** 2026-10-29
**Status:** Ready for planning
**Mode:** Auto-generated (Autonomous Mode)

<domain>
## Phase Boundary

Establish the full-stack project architecture with strictly enforced PostgreSQL Row-Level Security (RLS), server-side authentication, workspace management, multi-location support (Durban & Ballito), and automated tenant isolation tests.

Requirements covered:
- AUTH-01: Secure user registration, authentication, and persistent server sessions
- AUTH-02: Organization/workspace creation and invitation workflows
- AUTH-03: Workspace role-based access control (Owner, Admin, Manager, Agent, Read-only)
- AUTH-04: PostgreSQL Row Level Security (RLS) policies on all tenant tables
- AUTH-05: Automated cross-tenant security and RLS penetration tests
- WORK-01: Workspace profile configuration (name, branding, timezones)
- WORK-02: Multi-location management (Durban and Ballito clinics)
- WORK-03: Business operating hours per location
- WORK-04: Industry templates (Audiology, Dental, Real Estate, Professional Services)
</domain>

<decisions>
## Implementation Decisions

### 1. Application Architecture & UI Stack
- Next.js 15 App Router with React 19, TypeScript strict mode.
- Tailwind CSS 3.4+ / 4.x with CSS variable design tokens for workspace theming.
- shadcn/ui primitives built on Radix UI for accessible modal dialogs, dropdowns, forms, and popovers.
- Clean directory layout separating `app/` (routes), `components/` (UI), `lib/` (domain & auth), `supabase/migrations/` (PostgreSQL schemas & RLS policies).

### 2. Multi-Tenancy & PostgreSQL RLS
- Every tenant table contains `organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE`.
- RLS enabled and strictly forced on all tenant tables:
  `ALTER TABLE [table] ENABLE ROW LEVEL SECURITY; ALTER TABLE [table] FORCE ROW LEVEL SECURITY;`
- RLS policy checks membership:
  `EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = [table].organization_id AND organization_members.user_id = auth.uid())`
- Cross-tenant penetration tests verify that requests from User A in Org 1 attempting to query or mutate Org 2 records return 0 rows or 403 Forbidden.

### 3. Server-Side Authentication & Session Handling
- `@supabase/ssr` server cookie client configured in Next.js middleware and Server Actions.
- HTTP-only, SameSite=Lax, Secure session cookies; no client-side API keys exposed with elevated privileges.
- Centralized RBAC permission checks with helper `requirePermission(user, orgId, action)`.

### 4. Locations & Business Hours
- First-class `locations` table supporting multi-site organizations (e.g., Hoffman Audiology's Durban and Ballito practices).
- `business_hours` JSON/relational structure per location supporting Day of Week, open/close times, and timezone (defaulting to Africa/Johannesburg SAST, UTC+2).

### 5. Industry Templates
- Pre-seeded configuration templates for Audiology, Dental, Real Estate, and General Professional Services.
- Templates define default pipeline stages, loss reasons, contact tags, and custom field schemas.
</decisions>

<code_context>
## Existing Code Insights
- Greenfield codebase at `D:\CRM`.
- Need to initialize `package.json`, TypeScript configuration, Tailwind CSS, Supabase SSR helpers, database migration scripts, and test harnesses.
</code_context>

<specifics>
## Specific Deliverables
1. Working Next.js 15 full-stack application with Tailwind CSS and shadcn/ui.
2. Complete SQL migration files defining `organizations`, `organization_members`, `locations`, `workspace_settings`, and RLS policies.
3. Supabase Auth SSR integration with login, registration, workspace switcher, and settings management screens.
4. Location configuration screen supporting Durban and Ballito clinics with business hours.
5. Industry template selection system.
6. Automated test suite including Vitest and PostgreSQL RLS cross-tenant penetration test runner.
</specifics>

<deferred>
## Deferred Ideas
- Self-service credit card billing / Stripe integration (deferred to v2).
- WebRTC softphone dialer (deferred to v2).
</deferred>
