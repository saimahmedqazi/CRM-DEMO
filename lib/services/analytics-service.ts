import { leadService, InquirySource } from './lead-service';
import { appointmentService } from './appointment-service';

export interface FunnelStage {
  id: string;
  label: string;
  count: number;
  conversionFromPrevious: number;
  conversionFromTop: number;
}

export interface ChannelAttribution {
  source: InquirySource;
  label: string;
  inquiryCount: number;
  bookedCount: number;
  attendedCount: number;
  conversionRate: number; // attended / inquiryCount * 100
  revenueCents: number;
}

export interface LossReasonStat {
  reason: string;
  count: number;
  percentage: number;
}

export interface DashboardMetrics {
  totalInquiries: number;
  totalContacted: number;
  totalBooked: number;
  totalAttended: number;
  overallConversionRate: number; // %
  totalRevenueCents: number;
  avgResponseMinutes: number;
  funnelStages: FunnelStage[];
  channels: ChannelAttribution[];
  lossReasons: LossReasonStat[];
}

export interface AnalyticsFilter {
  locationId?: string;
  dateRange?: '7d' | '30d' | '90d' | 'all';
}

class AnalyticsService {
  public async getExecutiveDashboardMetrics(
    orgId: string,
    filter: AnalyticsFilter = {}
  ): Promise<DashboardMetrics> {
    // 1. Fetch raw inquiries and appointments
    const allInquiriesResult = leadService.getInquiries({
      orgId,
      pageSize: 10000,
      locationId: filter.locationId && filter.locationId !== 'all' ? filter.locationId : undefined,
    });
    let inquiries = allInquiriesResult.inquiries;

    const allAppointments = await appointmentService.listAppointments(orgId, {
      locationId: filter.locationId && filter.locationId !== 'all' ? filter.locationId : undefined,
    });

    // Date range filter
    if (filter.dateRange && filter.dateRange !== 'all') {
      const days = filter.dateRange === '7d' ? 7 : filter.dateRange === '30d' ? 30 : 90;
      const cutoff = new Date(Date.now() - days * 24 * 3600 * 1000).toISOString();
      inquiries = inquiries.filter((i) => i.created_at >= cutoff);
    }

    const totalInquiries = inquiries.length;

    // Contacted inquiries (anything moved past 'new')
    const contactedInquiries = inquiries.filter((i) => i.status !== 'new');
    const totalContacted = contactedInquiries.length;

    // Booked inquiries (status is appointment_booked or completed, or has an appointment linked)
    const bookedInquiryIds = new Set(
      allAppointments.map((a) => a.inquiry_id).filter(Boolean) as string[]
    );
    const bookedInquiries = inquiries.filter(
      (i) => i.status === 'appointment_booked' || i.status === 'completed' || bookedInquiryIds.has(i.id)
    );
    const totalBooked = bookedInquiries.length;

    // Attended appointments
    const attendedAppointments = allAppointments.filter((a) => a.status === 'attended');
    const attendedInquiryIds = new Set(
      attendedAppointments.map((a) => a.inquiry_id).filter(Boolean) as string[]
    );
    const attendedInquiries = inquiries.filter(
      (i) => i.status === 'completed' || attendedInquiryIds.has(i.id)
    );
    const totalAttended = attendedInquiries.length;

    const overallConversionRate =
      totalInquiries > 0 ? Math.round((totalAttended / totalInquiries) * 100) : 0;

    // Verified Revenue sum
    const totalRevenueCents = attendedAppointments.reduce(
      (sum, a) => sum + (a.revenue_cents || 0),
      0
    );

    // Response velocity (average minutes from creation to last_interaction_at for contacted inquiries)
    let avgResponseMinutes = 45; // default benchmark
    if (contactedInquiries.length > 0) {
      const totalMinutes = contactedInquiries.reduce((acc, inq) => {
        const created = new Date(inq.created_at).getTime();
        const interacted = new Date(inq.last_interaction_at || inq.updated_at).getTime();
        const diffMinutes = Math.max(5, Math.round((interacted - created) / (1000 * 60)));
        return acc + diffMinutes;
      }, 0);
      avgResponseMinutes = Math.min(120, Math.round(totalMinutes / contactedInquiries.length));
    }

    // 2. Funnel Stages
    const funnelStages: FunnelStage[] = [
      {
        id: 'new',
        label: 'New Inquiries',
        count: totalInquiries,
        conversionFromPrevious: 100,
        conversionFromTop: 100,
      },
      {
        id: 'contacted',
        label: 'First Contact Made',
        count: totalContacted,
        conversionFromPrevious:
          totalInquiries > 0 ? Math.round((totalContacted / totalInquiries) * 100) : 0,
        conversionFromTop:
          totalInquiries > 0 ? Math.round((totalContacted / totalInquiries) * 100) : 0,
      },
      {
        id: 'booked',
        label: 'Appointment Booked',
        count: totalBooked,
        conversionFromPrevious:
          totalContacted > 0 ? Math.round((totalBooked / totalContacted) * 100) : 0,
        conversionFromTop:
          totalInquiries > 0 ? Math.round((totalBooked / totalInquiries) * 100) : 0,
      },
      {
        id: 'attended',
        label: 'Attended / Completed',
        count: totalAttended,
        conversionFromPrevious:
          totalBooked > 0 ? Math.round((totalAttended / totalBooked) * 100) : 0,
        conversionFromTop: overallConversionRate,
      },
    ];

    // 3. Channel Attribution Breakdown
    const sourceLabels: Record<InquirySource, string> = {
      phone: 'Inbound Phone Call',
      whatsapp: 'WhatsApp Business',
      website: 'Website Web Form',
      meta_ads: 'Meta (Facebook/Instagram) Ads',
      email: 'Direct Email',
      walk_in: 'Clinic Walk-In',
      referral: 'Doctor / Patient Referral',
      portal: 'External Booking Portal',
      direct: 'Direct Inbound',
    };

    const sources: InquirySource[] = [
      'phone',
      'whatsapp',
      'website',
      'meta_ads',
      'email',
      'walk_in',
      'referral',
      'portal',
    ];

    const channels: ChannelAttribution[] = sources
      .map((source) => {
        const sourceInquiries = inquiries.filter((i) => i.source === source);
        const count = sourceInquiries.length;
        if (count === 0) return null;

        const sourceInquiryIds = new Set(sourceInquiries.map((i) => i.id));
        const booked = sourceInquiries.filter(
          (i) => i.status === 'appointment_booked' || i.status === 'completed' || bookedInquiryIds.has(i.id)
        ).length;
        const attended = sourceInquiries.filter(
          (i) => i.status === 'completed' || attendedInquiryIds.has(i.id)
        ).length;

        const revenue = allAppointments
          .filter((a) => a.inquiry_id && sourceInquiryIds.has(a.inquiry_id) && a.status === 'attended')
          .reduce((sum, a) => sum + (a.revenue_cents || 0), 0);

        return {
          source,
          label: sourceLabels[source] || source,
          inquiryCount: count,
          bookedCount: booked,
          attendedCount: attended,
          conversionRate: count > 0 ? Math.round((attended / count) * 100) : 0,
          revenueCents: revenue,
        };
      })
      .filter(Boolean) as ChannelAttribution[];

    // Sort channels by inquiry count descending
    channels.sort((a, b) => b.inquiryCount - a.inquiryCount);

    // 4. Loss Reason Breakdown
    const lostInquiries = inquiries.filter((i) => i.status === 'lost');
    const reasonCounts: Record<string, number> = {};
    lostInquiries.forEach((i) => {
      const reason = i.loss_reason || 'Unspecified / No response';
      reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
    });

    const totalLost = lostInquiries.length;
    const lossReasons: LossReasonStat[] = Object.entries(reasonCounts)
      .map(([reason, count]) => ({
        reason,
        count,
        percentage: totalLost > 0 ? Math.round((count / totalLost) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    return {
      totalInquiries,
      totalContacted,
      totalBooked,
      totalAttended,
      overallConversionRate,
      totalRevenueCents,
      avgResponseMinutes,
      funnelStages,
      channels,
      lossReasons,
    };
  }

  public async getMetricDrilldown(
    orgId: string,
    metricType: 'channel' | 'stage' | 'loss_reason',
    key: string,
    filter: AnalyticsFilter = {}
  ) {
    const all = leadService.getInquiries({
      orgId,
      pageSize: 1000,
      locationId: filter.locationId && filter.locationId !== 'all' ? filter.locationId : undefined,
    }).inquiries;

    if (metricType === 'channel') {
      return all.filter((i) => i.source === key);
    }

    if (metricType === 'stage') {
      if (key === 'new') return all.filter((i) => i.status === 'new');
      if (key === 'contacted') return all.filter((i) => i.status === 'contacted');
      if (key === 'booked') return all.filter((i) => i.status === 'appointment_booked');
      if (key === 'attended') return all.filter((i) => i.status === 'completed');
    }

    if (metricType === 'loss_reason') {
      return all.filter((i) => (i.loss_reason || 'Unspecified / No response') === key);
    }

    return all;
  }
}

export const analyticsService = new AnalyticsService();
