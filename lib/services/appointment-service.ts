import { normalizeEmail, normalizePhone } from '@/lib/deduplication/normalizer';
import { leadService } from './lead-service';
import { taskService } from './task-service';
import {
  persistentDemoStore,
  type DemoAppointment,
  type DemoUnmatchedBooking,
} from '@/lib/db/persistent-demo-store';

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'attended' | 'cancelled' | 'no_show';

export type AppointmentOutcome = 
  | 'hearing_aid_fitted'
  | 'assessment_completed'
  | 'follow_up_advised'
  | 'medical_referral'
  | 'wax_cleared'
  | 'other';

export interface Appointment extends DemoAppointment {
  status: AppointmentStatus;
  outcome?: AppointmentOutcome;
}

export interface UnmatchedBooking extends DemoUnmatchedBooking {}

export interface CreateAppointmentDTO {
  organization_id: string;
  contact_id: string;
  inquiry_id?: string;
  location_id?: string;
  title: string;
  appointment_type?: string;
  start_time: string;
  end_time: string;
  external_calendar_id?: string;
  external_provider?: string;
}

export interface ExternalBookingPayload {
  external_calendar_id: string;
  external_provider: 'google_calendar' | 'outlook' | 'calendly' | 'other';
  title: string;
  attendee_name: string;
  attendee_email?: string;
  attendee_phone?: string;
  location_id?: string;
  appointment_type?: string;
  start_time: string;
  end_time: string;
  raw_payload?: Record<string, any>;
}

function normalizeOrgId(orgId?: string | null): string {
  if (!orgId || orgId === 'hoffman-audiology' || orgId === 'org-hoffman-01') {
    return 'org-hoffman-01';
  }
  return orgId;
}

class AppointmentService {
  public async listAppointments(
    orgId: string,
    filters?: {
      status?: AppointmentStatus;
      locationId?: string;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<Appointment[]> {
    const targetOrg = normalizeOrgId(orgId);
    const store = persistentDemoStore.getData();

    return (store.appointments as Appointment[])
      .filter((a) => {
        if (normalizeOrgId(a.organization_id) !== targetOrg) return false;
        if (filters?.status && a.status !== filters.status) return false;
        if (filters?.locationId && a.location_id !== filters.locationId) return false;
        if (filters?.startDate && a.start_time < filters.startDate) return false;
        if (filters?.endDate && a.start_time > filters.endDate) return false;
        return true;
      })
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  }

  public async getAppointment(orgId: string, id: string): Promise<Appointment | null> {
    const targetOrg = normalizeOrgId(orgId);
    const store = persistentDemoStore.getData();
    return (store.appointments.find((a) => normalizeOrgId(a.organization_id) === targetOrg && a.id === id) as Appointment) || null;
  }

  public async createAppointment(dto: CreateAppointmentDTO): Promise<Appointment> {
    const orgId = normalizeOrgId(dto.organization_id);
    let appointment: Appointment;

    persistentDemoStore.mutate((store) => {
      appointment = {
        id: `appt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        organization_id: orgId,
        contact_id: dto.contact_id,
        inquiry_id: dto.inquiry_id,
        location_id: dto.location_id,
        title: dto.title,
        appointment_type: dto.appointment_type || 'hearing_assessment',
        start_time: dto.start_time,
        end_time: dto.end_time,
        status: 'scheduled',
        external_calendar_id: dto.external_calendar_id,
        external_provider: dto.external_provider,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      store.appointments.push(appointment);
    });

    // Update inquiry pipeline stage if attached
    if (dto.inquiry_id) {
      await leadService.updateInquiryStage(orgId, dto.inquiry_id, 'appointment_booked');
    }

    // Record activity note on contact
    leadService.recordActivity({
      organization_id: orgId,
      contact_id: dto.contact_id,
      inquiry_id: dto.inquiry_id,
      activity_type: 'appointment_scheduled',
      title: 'Appointment Scheduled',
      content: `Scheduled "${dto.title}" for ${new Date(dto.start_time).toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' })}.`,
    });

    return appointment!;
  }

  public async recordOutcome(
    orgId: string,
    appointmentId: string,
    outcome: AppointmentOutcome,
    outcomeNotes: string,
    revenueCents: number = 0
  ): Promise<Appointment> {
    const targetOrg = normalizeOrgId(orgId);
    let appt: Appointment | null = null;

    persistentDemoStore.mutate((store) => {
      const found = store.appointments.find(
        (a) => normalizeOrgId(a.organization_id) === targetOrg && a.id === appointmentId
      );
      if (!found) return;

      found.status = 'attended';
      found.outcome = outcome;
      found.outcome_notes = outcomeNotes;
      found.revenue_cents = revenueCents;
      found.updated_at = new Date().toISOString();
      appt = found as Appointment;
    });

    if (!appt) throw new Error('Appointment not found');

    // Advance inquiry stage to completed
    if ((appt as Appointment).inquiry_id) {
      await leadService.updateInquiryStage(targetOrg, (appt as Appointment).inquiry_id!, 'completed');
    }

    const outcomeLabels: Record<AppointmentOutcome, string> = {
      hearing_aid_fitted: 'Hearing Aid Fitted & Dispensed',
      assessment_completed: 'Diagnostic Assessment Completed',
      follow_up_advised: 'Follow-up Consultation Advised',
      medical_referral: 'ENT / Medical Specialist Referral',
      wax_cleared: 'Cerumen Removal Completed',
      other: 'Appointment Outcome Recorded',
    };

    leadService.recordActivity({
      organization_id: targetOrg,
      contact_id: (appt as Appointment).contact_id,
      inquiry_id: (appt as Appointment).inquiry_id,
      activity_type: 'appointment_attended',
      title: `Outcome: ${outcomeLabels[outcome]}`,
      content: `${outcomeNotes} ${revenueCents > 0 ? `(Verified Revenue: R ${(revenueCents / 100).toFixed(2)})` : ''}`,
    });

    return appt;
  }

  public async cancelAppointment(
    orgId: string,
    appointmentId: string,
    reason: string
  ): Promise<Appointment> {
    const targetOrg = normalizeOrgId(orgId);
    let appt: Appointment | null = null;

    persistentDemoStore.mutate((store) => {
      const found = store.appointments.find(
        (a) => normalizeOrgId(a.organization_id) === targetOrg && a.id === appointmentId
      );
      if (!found) return;

      found.status = 'cancelled';
      found.outcome_notes = `Cancelled: ${reason}`;
      found.updated_at = new Date().toISOString();
      appt = found as Appointment;
    });

    if (!appt) throw new Error('Appointment not found');

    leadService.recordActivity({
      organization_id: targetOrg,
      contact_id: (appt as Appointment).contact_id,
      inquiry_id: (appt as Appointment).inquiry_id,
      activity_type: 'note',
      title: 'Appointment Cancelled',
      content: `Cancelled: "${(appt as Appointment).title}". Reason: ${reason}`,
    });

    return appt;
  }

  public async markNoShow(
    orgId: string,
    appointmentId: string
  ): Promise<Appointment> {
    const targetOrg = normalizeOrgId(orgId);
    let appt: Appointment | null = null;

    persistentDemoStore.mutate((store) => {
      const found = store.appointments.find(
        (a) => normalizeOrgId(a.organization_id) === targetOrg && a.id === appointmentId
      );
      if (!found) return;

      found.status = 'no_show';
      found.updated_at = new Date().toISOString();
      appt = found as Appointment;
    });

    if (!appt) throw new Error('Appointment not found');

    taskService.createTask({
      organizationId: targetOrg,
      contactId: (appt as Appointment).contact_id,
      inquiryId: (appt as Appointment).inquiry_id,
      contactName: (appt as Appointment).title,
      title: `No-Show Follow-up: Rebook ${(appt as Appointment).title}`,
      description: `Patient did not attend scheduled appointment on ${new Date((appt as Appointment).start_time).toLocaleDateString('en-ZA')}. Contact immediately to reschedule.`,
      taskType: 'follow_up_call',
      priority: 'high',
      dueAt: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
    });

    leadService.recordActivity({
      organization_id: targetOrg,
      contact_id: (appt as Appointment).contact_id,
      inquiry_id: (appt as Appointment).inquiry_id,
      activity_type: 'note',
      title: 'Appointment No-Show',
      content: `Patient missed scheduled appointment "${(appt as Appointment).title}". High-priority rebooking task created.`,
    });

    return appt;
  }

  public async reconcileExternalBooking(
    orgId: string,
    payload: ExternalBookingPayload
  ): Promise<{
    status: 'existing' | 'matched' | 'unmatched';
    appointment?: Appointment;
    unmatchedBooking?: UnmatchedBooking;
    reason?: 'no_match' | 'multiple_candidates';
  }> {
    const targetOrg = normalizeOrgId(orgId);
    const store = persistentDemoStore.getData();

    // 1. Idempotency Check
    const existing = store.appointments.find(
      (a) => normalizeOrgId(a.organization_id) === targetOrg && a.external_calendar_id === payload.external_calendar_id
    );
    if (existing) {
      return { status: 'existing', appointment: existing as Appointment };
    }

    // 2. Candidate Matching via normalized phone and email
    const normPhone = payload.attendee_phone ? normalizePhone(payload.attendee_phone) : null;
    const normEmail = payload.attendee_email ? normalizeEmail(payload.attendee_email) : null;

    const matchedContacts = leadService.findContactsByOrg(targetOrg).filter((contact) => {
      const phoneMatch = normPhone && contact.phone_normalized === normPhone;
      const emailMatch = normEmail && contact.email === normEmail;
      return phoneMatch || emailMatch;
    });

    // 3. Exact 1 candidate match -> Link appointment cleanly
    if (matchedContacts.length === 1) {
      const contact = matchedContacts[0];
      const inquiries = leadService.findInquiriesByContact(contact.id);
      const latestInquiry = inquiries[0];

      const appointment = await this.createAppointment({
        organization_id: targetOrg,
        contact_id: contact.id,
        inquiry_id: latestInquiry?.id,
        location_id: payload.location_id,
        title: payload.title,
        appointment_type: payload.appointment_type || 'hearing_assessment',
        start_time: payload.start_time,
        end_time: payload.end_time,
        external_calendar_id: payload.external_calendar_id,
        external_provider: payload.external_provider,
      });

      return { status: 'matched', appointment };
    }

    // 4. Zero matches or Ambiguous multiple matches -> Dispatch to Unmatched Queue
    let unmatchedRecord: UnmatchedBooking;

    persistentDemoStore.mutate((s) => {
      unmatchedRecord = {
        id: `unmatched-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        organization_id: targetOrg,
        external_calendar_id: payload.external_calendar_id,
        external_provider: payload.external_provider,
        title: payload.title,
        attendee_name: payload.attendee_name,
        attendee_email: normEmail || undefined,
        attendee_phone: normPhone || undefined,
        start_time: payload.start_time,
        end_time: payload.end_time,
        raw_payload: payload.raw_payload || {},
        resolution_status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      s.unmatched_bookings.push(unmatchedRecord);
    });

    return {
      status: 'unmatched',
      unmatchedBooking: unmatchedRecord!,
      reason: matchedContacts.length === 0 ? 'no_match' : 'multiple_candidates',
    };
  }

  public async listUnmatchedBookings(
    orgId: string,
    status?: 'pending' | 'matched' | 'created_new' | 'ignored'
  ): Promise<UnmatchedBooking[]> {
    const targetOrg = normalizeOrgId(orgId);
    return (persistentDemoStore.getData().unmatched_bookings as UnmatchedBooking[])
      .filter((u) => normalizeOrgId(u.organization_id) === targetOrg && (!status || u.resolution_status === status))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public async resolveUnmatchedBooking(
    orgId: string,
    unmatchedId: string,
    action: 'match_existing' | 'create_new' | 'create_new_contact' | 'ignore',
    targetContactId?: string
  ): Promise<{ success: boolean; unmatched?: UnmatchedBooking; appointment?: Appointment }> {
    const targetOrg = normalizeOrgId(orgId);
    let unmatched: UnmatchedBooking | undefined;

    const store = persistentDemoStore.getData();
    unmatched = store.unmatched_bookings.find(
      (u) => normalizeOrgId(u.organization_id) === targetOrg && u.id === unmatchedId
    ) as UnmatchedBooking | undefined;

    if (!unmatched) throw new Error('Unmatched booking not found');

    if (action === 'ignore') {
      let updated: UnmatchedBooking = unmatched;
      persistentDemoStore.mutate((s) => {
        const item = s.unmatched_bookings.find((u) => u.id === unmatchedId);
        if (item) {
          item.resolution_status = 'ignored';
          item.updated_at = new Date().toISOString();
          updated = item as UnmatchedBooking;
        }
      });
      return { success: true, unmatched: updated };
    }

    let finalContactId = targetContactId;

    if (action === 'create_new' || action === 'create_new_contact') {
      const nameParts = (unmatched.attendee_name || 'Calendar Patient').split(' ');
      const firstName = nameParts[0] || 'Unknown';
      const lastName = nameParts.slice(1).join(' ') || '';

      const { contact } = leadService.createLead({
        organization_id: targetOrg,
        first_name: firstName,
        last_name: lastName,
        email: unmatched.attendee_email,
        phone: unmatched.attendee_phone,
        source: 'portal',
        notes: `Created from unmatched calendar booking: "${unmatched.title}"`,
      });
      finalContactId = contact.id;
    }

    if (!finalContactId) throw new Error('Target contact ID required for matching');

    const appointment = await this.createAppointment({
      organization_id: targetOrg,
      contact_id: finalContactId,
      title: unmatched.title,
      start_time: unmatched.start_time,
      end_time: unmatched.end_time,
      external_calendar_id: unmatched.external_calendar_id,
      external_provider: unmatched.external_provider,
    });

    let updatedUnmatched: UnmatchedBooking = unmatched;
    persistentDemoStore.mutate((s) => {
      const item = s.unmatched_bookings.find((u) => u.id === unmatchedId);
      if (item) {
        item.resolution_status = (action === 'create_new' || action === 'create_new_contact') ? 'created_new' : 'matched';
        item.resolved_contact_id = finalContactId;
        item.updated_at = new Date().toISOString();
        updatedUnmatched = item as UnmatchedBooking;
      }
    });

    return { success: true, unmatched: updatedUnmatched, appointment };
  }
}

export const appointmentService = new AppointmentService();
