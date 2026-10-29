# Phase 6 Context: Reusable Integration Framework & Webhooks

## Overview
Phase 6 builds the multi-channel ingestion backbone for Kuro Solutions CRM.
Inquiries originate from diverse sources: patients filling out website forms on Dr. Kara Hoffman's website, messaging on WhatsApp, clicking Facebook/Instagram Lead Ads, sending direct emails, or calling the clinic telephone line.
This phase delivers production-grade adapters, webhook security (HMAC-SHA256 + idempotency), an embeddable website lead form, a public authenticated ingest REST API, and an interactive Integrations Hub simulator.

## Requirements & Scope
- **INTG-01**: Embeddable website lead form with field validation, honeypot spam protection, and attribution metadata.
- **INTG-02**: Public hosted embed route `app/embed/[orgSlug]/page.tsx` for iframe embedding or direct linking.
- **INTG-03**: Ingest REST API route `app/api/v1/ingest/route.ts` secured with workspace API keys and rate limiting.
- **INTG-04**: HMAC-SHA256 webhook signature verifier and database idempotency log to eliminate replay attacks.
- **INTG-05**: Meta WhatsApp Business Cloud API webhook adapter parsing inbound patient messages.
- **INTG-06**: Meta Lead Ads adapter parsing incoming Facebook/Instagram form leads.
- **INTG-07**: Email & Phone PBX call log adapters.
- **INTG-08**: Integrations Hub UI (`app/(dashboard)/[orgSlug]/integrations/page.tsx`) with interactive sandbox simulator for credentials-free verification.

## Architecture
- `supabase/migrations/20261029000005_integrations_and_api_keys.sql`: Schema for `api_keys`, `webhook_events`, and `integration_configs` with forced RLS.
- `lib/integrations/webhook-verifier.ts`: HMAC verification and idempotency check.
- `lib/integrations/adapters/`:
  - `whatsapp-adapter.ts`
  - `meta-ads-adapter.ts`
  - `email-adapter.ts`
  - `phone-logger-adapter.ts`
- `app/api/v1/ingest/route.ts`: Ingest REST API endpoint.
- `app/api/v1/webhooks/[provider]/route.ts`: Webhook receiver endpoint.
- `app/embed/[orgSlug]/page.tsx`: Clean standalone lead capture widget.
- `components/integrations/sandbox-simulator.tsx`: Interactive test harness with realistic payload fixtures.
- `tests/unit/webhooks.test.ts`: Vitest suite validating HMAC verification, replay attack rejection, and adapter payload transformations.
