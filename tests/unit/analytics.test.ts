import { describe, it, expect, beforeEach } from 'vitest';
import { analyticsService } from '@/lib/services/analytics-service';
import { leadService } from '@/lib/services/lead-service';
import { appointmentService } from '@/lib/services/appointment-service';

describe('Conversion & Source Attribution Analytics Engine', () => {
  const orgId = 'org-analytics-test';

  beforeEach(async () => {
    // Seed controlled dataset
    // 1. WhatsApp lead -> Booked -> Attended with R38,000 revenue
    const lead1 = leadService.createLead({
      organization_id: orgId,
      first_name: 'Pieter',
      last_name: 'Botha',
      email: 'pieter.botha@example.com',
      phone: '+27821112233',
      source: 'whatsapp',
      status: 'completed',
    });
    const appt1 = await appointmentService.createAppointment({
      organization_id: orgId,
      contact_id: lead1.contact.id,
      inquiry_id: lead1.inquiry.id,
      title: 'Bilateral Fitting',
      start_time: '2026-11-01T10:00:00Z',
      end_time: '2026-11-01T11:00:00Z',
    });
    await appointmentService.recordOutcome(
      orgId,
      appt1.id,
      'hearing_aid_fitted',
      'Fitted successfully',
      3800000
    );

    // 2. Phone lead -> Contacted
    leadService.createLead({
      organization_id: orgId,
      first_name: 'Anil',
      last_name: 'Maharaj',
      email: 'anil.m@example.com',
      phone: '+27834445566',
      source: 'phone',
      status: 'contacted',
    });

    // 3. Website lead -> Lost (Price too high)
    const lead3 = leadService.createLead({
      organization_id: orgId,
      first_name: 'Karen',
      last_name: 'Smith',
      email: 'karen.smith@example.com',
      phone: '+27847778899',
      source: 'website',
      status: 'lost',
    });
    leadService.updateInquiryStage(orgId, lead3.inquiry.id, 'lost', 'Price too high');

    // 4. Meta Ads lead -> New Inquiry
    leadService.createLead({
      organization_id: orgId,
      first_name: 'Sipho',
      last_name: 'Mhlongo',
      email: 'sipho.m@example.com',
      phone: '+27712223344',
      source: 'meta_ads',
      status: 'new',
    });
  });

  it('aggregates multi-step conversion funnel correctly', async () => {
    const metrics = await analyticsService.getExecutiveDashboardMetrics(orgId);

    expect(metrics.totalInquiries).toBeGreaterThanOrEqual(4);
    expect(metrics.totalContacted).toBeGreaterThanOrEqual(3);
    expect(metrics.totalBooked).toBeGreaterThanOrEqual(1);
    expect(metrics.totalAttended).toBeGreaterThanOrEqual(1);

    const funnel = metrics.funnelStages;
    expect(funnel).toHaveLength(4);
    expect(funnel[0].id).toBe('new');
    expect(funnel[1].id).toBe('contacted');
    expect(funnel[2].id).toBe('booked');
    expect(funnel[3].id).toBe('attended');
  });

  it('calculates source attribution breakdown and confirmed revenue', async () => {
    const metrics = await analyticsService.getExecutiveDashboardMetrics(orgId);

    const whatsapp = metrics.channels.find((c) => c.source === 'whatsapp');
    expect(whatsapp).toBeDefined();
    expect(whatsapp?.inquiryCount).toBeGreaterThanOrEqual(1);
    expect(whatsapp?.attendedCount).toBeGreaterThanOrEqual(1);
    expect(whatsapp?.revenueCents).toBeGreaterThanOrEqual(3800000);

    const phone = metrics.channels.find((c) => c.source === 'phone');
    expect(phone).toBeDefined();
    expect(phone?.inquiryCount).toBeGreaterThanOrEqual(1);
  });

  it('aggregates documented loss reasons', async () => {
    const metrics = await analyticsService.getExecutiveDashboardMetrics(orgId);

    expect(metrics.lossReasons.length).toBeGreaterThanOrEqual(1);
    const priceLost = metrics.lossReasons.find((r) => r.reason === 'Price too high');
    expect(priceLost).toBeDefined();
    expect(priceLost?.count).toBeGreaterThanOrEqual(1);
  });

  it('drill-down returns matching underlying inquiry records', async () => {
    const drilldown = await analyticsService.getMetricDrilldown(orgId, 'channel', 'whatsapp');
    expect(drilldown.length).toBeGreaterThanOrEqual(1);
    expect(drilldown[0].source).toBe('whatsapp');
  });
});
