# Phase 5 Context: Conversion & Source Attribution Analytics

## Overview
Phase 5 builds the business intelligence and attribution reporting engine for Kuro Solutions CRM.
For Dr. Kara Hoffman and appointment-led business owners, the core value proposition is transparency: answering exactly which marketing channels (Phone, WhatsApp, Website, Meta Ads, Email) generate paying patients, how quickly staff respond, and where leads fall out of the conversion funnel.

## Requirements & Scope
- **ANLY-01**: Conversion Funnel: Stage-by-stage progression (New Inquiry -> Contacted -> Booked -> Attended/Completed) with conversion percentages.
- **ANLY-02**: Source Attribution Breakdown: Channel volume, conversion rates, and confirmed revenue per source.
- **ANLY-03**: Response Velocity KPI: Average business-hours response speed compared to 2-hour SLA.
- **ANLY-04**: Loss Reason Analysis: Distribution of lost inquiries by reason.
- **ANLY-05**: Underlying Record Drill-Down: Clicking any reported metric opens the underlying inquiries/contacts list.
- **ANLY-06**: Location & Date Filters: Comparing Durban vs Ballito clinic performance across selectable date ranges.

## Architecture
- `lib/services/analytics-service.ts`: Deterministic analytics aggregator calculating funnel stages, channel ROI, velocity, loss reasons, and drill-down record sets.
- `app/(dashboard)/[orgSlug]/analytics/page.tsx`: Executive dashboard view with KPI tiles, conversion funnel, source attribution breakdown, loss reason chart, and drill-down drawer.
- `components/analytics/attribution-chart.tsx`: Source performance table and visual bar attribution.
- `components/analytics/conversion-funnel.tsx`: Visual multi-step conversion funnel.
- `components/analytics/drilldown-drawer.tsx`: Slide-over inspector showing underlying leads for any metric.
- `tests/unit/analytics.test.ts`: Vitest suite verifying funnel calculations, revenue sums, response velocity, and zero double-counting.
