<!-- GSD:project-start source:PROJECT.md -->

## Project

**Kuro Solutions CRM SaaS (Multi-Tenant Appointment-Led CRM)**

A commercial-grade, multi-tenant CRM Software-as-a-Service designed for appointment-led businesses, clinics, and professional practices. It unifies inquiries across voice, email, web forms, messaging (WhatsApp), and social ads into a centralized inbox, orchestrates follow-ups and daily task queues, tracks appointment lifecycles from inquiry to confirmed outcome, and provides transparent attribution analytics. The platform launches with an initial tailored workspace for Hoffman Audiology Inc. (Durban and Ballito, South Africa) while remaining fully configurable and white-labelable across industries.

**Core Value:** Capture every inbound customer inquiry across all channels, prevent leads from falling through the cracks with deterministic follow-up workflows, and deliver auditable attribution on which inquiries convert into completed appointments.

### Constraints

- **Security & Multi-Tenancy**: Tenant isolation must be strictly enforced via PostgreSQL Row-Level Security (RLS) policies based on authenticated `organization_id`, verified with automated cross-tenant penetration tests.
- **Vendor Portability**: Business logic and database schemas must use standard PostgreSQL features and clean repository/adapter abstractions to avoid vendor lock-in.
- **AI Safety**: Groq AI integration must be isolated behind a server-side provider interface, completely disabled by default, and never receive unmasked personally identifiable or health information.
- **Performance Budget**: Lead inbox and search queries must execute in < 200ms on datasets of 100,000+ records via proper B-tree/GIN indexing and server-side cursor/page pagination.
- **Integrations Reality**: When external third-party production credentials (e.g. Meta App Review, WhatsApp Business WABA, live telecom trunks) are not present, provide clean mock adapters, test harnesses, and webhook simulators alongside the production interface.

<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->

## Technology Stack

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js (App Router) | 15.x | Full-stack React framework | First-class React Server Components, secure Server Actions, streaming SSR, built-in Route Handlers for webhooks. |
| React | 19.x | UI library | Fast concurrent rendering, native form actions, optimistic UI updates. |
| TypeScript | 5.x | Static typing | Strict type safety across client, server actions, API routes, and database schemas. |
| Tailwind CSS | 3.4+ / 4.x | Utility-first CSS | Highly maintainable, responsive styling, design system tokens for white-label workspace theming. |
| shadcn/ui (Radix UI) | Latest | Accessible UI components | Unstyled accessible primitives (dialogs, dropdowns, popovers, tabs) with full source control in repo. |
| PostgreSQL | 15+ / 16+ | Relational multi-tenant database | Native Row-Level Security (RLS), ACID transactions, JSONB custom fields, full-text search indexes. |
| Supabase Auth / SSR | Latest (`@supabase/ssr`) | Secure server-side authentication | HTTP-only cookie session handling, JWT tenant claims, secure password hashing, MFA ready. |
| Zod | 3.23+ | Runtime schema validation | Unified request, form, webhook, and AI structured output validation. |
| TanStack Table | 8.x | High-performance data tables | Headless, highly performant virtualization and server-side pagination for 100k+ lead datasets. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@tanstack/react-virtual` | 3.x | DOM Virtualization | Rendering large lists and Kanban lanes smoothly. |
| `lucide-react` | Latest | Iconography | Clean, consistent UI iconography across all views. |
| `date-fns` / `date-fns-tz` | 3.x / 4.x | Date & timezone math | Calculating follow-up due dates, business hours, and South Africa Standard Time (SAST, UTC+2). |
| `groq-sdk` | Latest | Server-side AI client | Opt-in lead summarization, follow-up drafting, and intent classification behind abstraction layer. |
| `papaparse` | 5.x | Fast CSV parsing | Client & server CSV import/export with streaming support and error recovery. |
| `canvas-confetti` / sonner | Latest | UI feedback & toasts | Accessible toast alerts for user interactions and mutations. |

### Development & Testing Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Vitest | Unit & Integration testing | Fast ESM test runner compatible with Vite/Next.js mocks. |
| Playwright | End-to-end browser testing | Multi-browser cross-tenant security and user workflow validation. |
| pg-tap / custom SQL runner | Database RLS policy tests | Direct verification of PostgreSQL tenant boundaries and isolation rules. |
| Docker & Compose | Local reproducible environment | Portable local PostgreSQL, Redis/queue, and app containerization. |

## Installation

# Core framework & UI

# Data & Forms

# Optional AI

# Dev & Testing

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Next.js App Router | Remix / Vite SPA | Single-page app without server-rendered SEO or enterprise internal portal; App Router chosen for unified API, server actions, and SSR security. |
| PostgreSQL Native RLS | Application-level tenant ID checks (`WHERE org_id = ?`) | Simpler ORMs without native RLS; Native RLS chosen because software bugs cannot accidentally leak cross-tenant data. |
| shadcn/ui | MUI / Ant Design | Enterprise admin apps needing pre-baked dense widgets; shadcn chosen for zero-runtime overhead and total aesthetic customizability per workspace. |
| TanStack Table | Ag-Grid | Complex enterprise pivot tables with massive enterprise licensing budgets; TanStack Table is lightweight, MIT licensed, and fully headless. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Client-side Supabase keys for sensitive queries | Bypasses server-side authorization controls and exposes schema | Server Actions & Route Handlers with authenticated server client |
| Prisma / heavy ORMs that complicate PostgreSQL RLS | Prisma creates connection pooling hurdles with dynamic RLS session variables (`SET LOCAL app.current_tenant_id`) | Direct parameterized PostgreSQL client or Supabase client with native RLS |
| Puppeteer / Scraping for WhatsApp | High ban risk, violates Meta ToS, brittle | Official Meta WhatsApp Business Platform Cloud API |
| Plain SQL string concatenation | Critical SQL injection risk | Parameterized queries and type-safe query builders |

## Stack Patterns by Variant

- Run PostgreSQL via Docker or local Supabase CLI.
- Use mock integration adapters (Mock WhatsApp, Mock Email, Mock Meta Ads, Mock Call logs) with deterministic fixtures.
- Connect to managed PostgreSQL / Supabase with connection pooling (PgBouncer/Supavisor).
- Enforce strict environment variable validation on boot via Zod.

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| `next@15.x` | `react@19.x` | Next.js 15 requires React 19; ensure all UI libraries support React 19 hooks. |
| `@supabase/ssr` | Next.js 15 App Router | Uses server cookies with middleware and Server Actions correctly. |
| `@tanstack/react-table@8.x` | React 19 | Fully compatible with functional React component updates. |
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->

## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->

## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->

## Project Skills

No project skills found. Add skills to any of: `.agents/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->

## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:

- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->

## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
