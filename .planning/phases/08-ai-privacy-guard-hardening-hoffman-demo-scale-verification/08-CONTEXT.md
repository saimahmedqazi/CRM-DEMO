# Phase 8 Context: AI Privacy Guard, Security Hardening, Hoffman Demo & Scale Verification

## Overview
Phase 8 represents the capstone phase for the commercial Kuro Solutions CRM SaaS.
It brings together:
1. **Server-Side Groq AI with POPIA Privacy Redaction**: AI capabilities (follow-up drafting, intake timeline summaries) isolated behind a provider interface, strictly opt-in per workspace, and protected by an automated PII/PHI redaction layer that cleans South African ID numbers, phone numbers, emails, and patient names before prompting.
2. **Regulatory & Security Hardening**: POPIA Right-to-be-Forgotten anonymization and DSAR data export endpoints, robust security headers, and CSRF protection.
3. **Turnkey Hoffman Audiology Demonstration Workspace**: Complete multi-channel dataset across Durban Musgrave and Ballito clinics with real-world audiology appointments and outcomes.
4. **100,000 Lead Scale & Performance Benchmark**: Proves <200ms query latency on massive datasets via proper indexing and pagination.

## Requirements & Scope
- **AI-01**: Server-side Groq provider abstraction with graceful fallback.
- **AI-02**: POPIA PII/PHI redactor (SA ID, phone, email, names, medical text).
- **AI-03**: AI follow-up drafting with human confirmation gates.
- **AI-04**: Patient conversation timeline summarizer.
- **AI-05**: Interactive AI Assistant widget in lead detail drawer.
- **SEC-01**: POPIA Data Subject Access Request export (`/api/v1/privacy/export`).
- **SEC-02**: POPIA Right-to-be-Forgotten deletion (`/api/v1/privacy/delete`).
- **SEC-03**: Security headers and CSRF protection.
- **SEC-04**: Hoffman Audiology turnkey demonstration data.
- **SEC-05**: 100,000 synthetic lead query benchmark (<200ms).

## Architecture
- `lib/ai/groq-provider.ts`: Server-side Groq client with opt-in workspace check and mock fallback.
- `lib/ai/privacy-redactor.ts`: Regex and token masking for POPIA compliance.
- `app/api/v1/privacy/export/route.ts`: POPIA DSAR export endpoint.
- `app/api/v1/privacy/delete/route.ts`: POPIA right-to-be-forgotten endpoint.
- `components/lead-inbox/ai-assistant-widget.tsx`: Follow-up draft and summary drawer widget.
- `tests/unit/ai-privacy.test.ts`: Unit tests validating PII/PHI scrubbing and Groq provider fallback.
- `tests/benchmark/scale-100k.test.ts`: Scale test asserting sub-200ms latency on 100,000 leads.
