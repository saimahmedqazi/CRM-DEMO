---
phase: 06-reusable-integration-framework-webhooks
plan: 01
subsystem: ingest-api-and-embed-form
tags: [ingest-api, embed-form, honeypot, popia, api-keys, postgres, rls]

requires:
  - phase: 05-conversion-source-attribution-analytics
    provides: Attribution analytics and lead service
provides:
  - PostgreSQL schema for api_keys, integration_configs, and webhook_events with forced RLS
  - Authenticated Ingest REST API route (`/api/v1/ingest`) with API key security and Zod validation
  - Embeddable website lead form (`EmbeddableForm`) with honeypot anti-spam protection and UTM tracking
  - Standalone hosted embed route (`/embed/[orgSlug]`) for iframe integration

actuals:
  tokens: 3100
  tasks: 2
  commits: 1

tech-stack:
  added: [ingest-api, embeddable-form, honeypot-defense]
  patterns: [Honeypot bot trapping, API key header authentication, UTM parameter attribution]

key-files:
  created:
    - supabase/migrations/20261029000005_integrations_and_api_keys.sql
    - app/api/v1/ingest/route.ts
    - app/embed/[orgSlug]/page.tsx
    - components/integrations/embeddable-form.tsx

key-decisions:
  - "The embed form silently accepts honeypot-filled submissions without recording leads, disarming spam scrapers"
  - "Public REST Ingest API requires x-api-key header and validates all inputs through strict Zod schemas"

patterns-established:
  - "Pattern 1: Form automatically collects query string UTM parameters and appends campaign tags"

requirements-completed: [INTG-01, INTG-02, INTG-03]

coverage:
  - id: I1
    description: "PostgreSQL schema for api_keys and integration_configs"
    requirement: "INTG-03"
    verification:
      - kind: integration
        ref: "supabase/migrations/20261029000005_integrations_and_api_keys.sql"
        status: pass
    human_judgment: false
  - id: I2
    description: "Embeddable form with honeypot and POPIA consent"
    requirement: "INTG-01"
    verification:
      - kind: code-check
        ref: "components/integrations/embeddable-form.tsx"
        status: pass
    human_judgment: false
  - id: I3
    description: "Ingest REST API endpoint"
    requirement: "INTG-03"
    verification:
      - kind: build
        ref: "app/api/v1/ingest/route.ts"
        status: pass
    human_judgment: false

duration: 15min
completed: 2026-10-29
status: complete
---

# Phase 06: Plan 01 Summary

**Delivered PostgreSQL integrations schema with forced RLS, Authenticated Ingest REST API, and embeddable web form with honeypot spam protection.**

## Performance
- Duration: 15 min
- Migration: 3 tables created (`api_keys`, `integration_configs`, `webhook_events`) with forced RLS
- Build: Next.js routes `/embed/[orgSlug]` and `/api/v1/ingest` compiled cleanly
