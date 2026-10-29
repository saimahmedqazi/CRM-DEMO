# Stack Research

**Domain:** Multi-Tenant Appointment-Led CRM SaaS
**Researched:** 2026-10-29
**Confidence:** HIGH

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

```bash
# Core framework & UI
npm install next react react-dom typescript @types/node @types/react @types/react-dom
npm install tailwindcss postcss autoprefixer tailwindcss-animate
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-select @radix-ui/react-slot @radix-ui/react-tabs @radix-ui/react-popover @radix-ui/react-tooltip
npm install class-variance-authority clsx tailwind-merge lucide-react

# Data & Forms
npm install @supabase/ssr @supabase/supabase-js pg
npm install @tanstack/react-table @tanstack/react-virtual
npm install zod react-hook-form @hookform/resolvers
npm install date-fns date-fns-tz papaparse sonner

# Optional AI
npm install groq-sdk

# Dev & Testing
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom playwright
```

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

**If Local Development / CI:**
- Run PostgreSQL via Docker or local Supabase CLI.
- Use mock integration adapters (Mock WhatsApp, Mock Email, Mock Meta Ads, Mock Call logs) with deterministic fixtures.

**If Production:**
- Connect to managed PostgreSQL / Supabase with connection pooling (PgBouncer/Supavisor).
- Enforce strict environment variable validation on boot via Zod.

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| `next@15.x` | `react@19.x` | Next.js 15 requires React 19; ensure all UI libraries support React 19 hooks. |
| `@supabase/ssr` | Next.js 15 App Router | Uses server cookies with middleware and Server Actions correctly. |
| `@tanstack/react-table@8.x` | React 19 | Fully compatible with functional React component updates. |
