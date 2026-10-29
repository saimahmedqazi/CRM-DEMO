import { normalizeEmail, normalizePhone } from '@/lib/deduplication/normalizer';
import { leadService } from './lead-service';
import { taskService } from './task-service';

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'attended' | 'cancelled' | 'no_show';

export type AppointmentOutcome = 
  | 'hearing_aid_fitted'
  | 'assessment_completed'
  | 'follow_up_advised'
  | 'medical_referral'
  | 'wax_cleared'
  | 'other';

export interface Appointment {
  id: string;
  organization_id: string;
  contact_id: string;
  inquiry_id?: string;
  location_id?: string;
  title: string;
  appointment_type: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  outcome?: AppointmentOutcome;
  outcome_notes?: string;
  revenue_cents?: number;
  external_calendar_id?: string;
  external_provider?: string;
  created_at: string;
  updated_at: string;
}

export interface UnmatchedBooking {
  id: string;
  organization_id: string;
  external_calendar_id: string;
  external_provider: string;
  title: string;
  attendee_name?: string;
  attendee_email?: string;
  attendee_phone?: string;
  start_time: string;
  end_time: string;
  raw_payload?: Record<string, any>;
  resolution_status: 'pending' | 'matched' | 'created_new' | 'ignored';
  resolved_contact_id?: string;
  created_at: string;
  updated_at: string;
}

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
  start_time: string;
  end_time: string;
  location_id?: string;
  appointment_type?: string;
  raw_payload?: Record<string, any>;
}

// In-memory demo store
const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'appt-1',
    organization_id: 'org-hoffman-01',
    contact_id: 'c-1',
    inquiry_id: 'inq-1',
    location_id: 'loc-dbn-01',
    title: 'Comprehensive Diagnostic Audiogram',
    appointment_type: 'hearing_assessment',
    start_time: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
    end_time: new Date(Date.now() + 3 * 3600 * 1000).toISOString(),
    status: 'confirmed',
    revenue_cents: 85000,
    created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'appt-2',
    organization_id: 'org-hoffman-01',
    contact_id: 'c-2',
    inquiry_id: 'inq-2',
    location_id: 'loc-blt-01',
    title: 'Oticon Intent Fitting & Consultation',
    appointment_type: 'hearing_aid_fitting',
    start_time: new Date(Date.now() + 26 * 3600 * 1000).toISOString(),
    end_time: new Date(Date.now() + 27 * 3600 * 1000).toISOString(),
    status: 'scheduled',
    revenue_cents: 3800000,
    created_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
  },
  {
    id: 'appt-3',
    organization_id: 'org-hoffman-01',
    contact_id: 'c-3',
    inquiry_id: 'inq-3',
    location_id: 'loc-dbn-01',
    title: 'Microsuction Wax Removal & Tympanometry',
    appointment_type: 'wax_removal',
    start_time: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    end_time: new Date(Date.now() - 23 * 3600 * 1000).toISOString(),
    status: 'attended',
    outcome: 'wax_cleared',
    outcome_notes: 'Bilateral cerumen impaction safely cleared via gentle microsuction. Normal conductive pathways restored.',
    revenue_cents: 65000,
    created_at: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  }
];

const INITIAL_UNMATCHED: UnmatchedBooking[] = [
  {
    id: 'unmatched-1',
    organization_id: 'org-hoffman-01',
    external_calendar_id: 'gcal_evt_998127391',
    external_provider: 'google_calendar',
    title: 'Dr. Hoffman Consultation (Direct GCal)',
    attendee_name: 'Pieter van der Merwe',
    attendee_email: 'pieter.vandermerwe@workmail.co.za',
    attendee_phone: '+27839994821',
    start_time: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
    end_time: new Date(Date.now() + 49 * 3600 * 1000).toISOString(),
    raw_payload: { source: 'Google Calendar Sync', calendar: 'Durban Clinic Room 1' },
    resolution_status: 'pending',
    created_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
  }
];

class AppointmentService {
  private appointments: Appointment[] = [...INITIAL_APPOINTMENTS];
  private unmatchedBookings: UnmatchedBooking[] = [...INITIAL_UNMATCHED];

  public async listAppointments(
    orgId: string,
    filters?: {
      status?: AppointmentStatus;
      locationId?: string;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<Appointment[]> {
    return this.appointments.filter((a) => {
      if (a.organization_id !== orgId) return false;
      if (filters?.status && a.status !== filters.status) return false;
      if (filters?.locationId && a.location_id !== filters.locationId) return false;
      if (filters?.startDate && a.start_time < filters.startDate) return false;
      if (filters?.endDate && a.start_time > filters.endDate) return false;
      return true;
    }).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  }

  public async getAppointment(orgId: string, id: string): Promise<Appointment | null> {
    return this.appointments.find((a) => a.organization_id === orgId && a.id === id) || null;
  }

  public async createAppointment(dto: CreateAppointmentDTO): Promise<Appointment> {
    const appointment: Appointment = {
      id: `appt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      organization_id: dto.organization_id,
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

    this.appointments.push(appointment);

    // Update inquiry pipeline stage if attached
    if (dto.inquiry_id) {
      await leadService.updateInquiryStage(dto.organization_id, dto.inquiry_id, 'appointment_booked');
    }

    // Record activity note on contact
    leadService.recordActivity({
      organization_id: dto.organization_id,
      contact_id: dto.contact_id,
      inquiry_id: dto.inquiry_id,
      activity_type: 'appointment_scheduled',
      title: 'Appointment Scheduled',
      content: `Scheduled "${dto.title}" for ${new Date(dto.start_time).toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' })}.`,
    });

    return appointment;
  }

  public async recordOutcome(
    orgId: string,
    appointmentId: string,
    outcome: AppointmentOutcome,
    outcomeNotes: string,
    revenueCents: number = 0
  ): Promise<Appointment> {
    const appt = await this.getAppointment(orgId, appointmentId);
    if (!appt) throw new Error('Appointment not found');

    appt.status = 'attended';
    appt.outcome = outcome;
    appt.outcome_notes = outcomeNotes;
    appt.revenue_cents = revenueCents;
    appt.updated_at = new Date().toISOString();

    // Advance inquiry stage to completed
    if (appt.inquiry_id) {
      await leadService.updateInquiryStage(orgId, appt.inquiry_id, 'completed');
    }

    // Format human outcome label
    const outcomeLabels: Record<AppointmentOutcome, string> = {
      hearing_aid_fitted: 'Hearing Aid Fitted & Dispensed',
      assessment_completed: 'Diagnostic Assessment Completed',
      follow_up_advised: 'Follow-up Consultation Advised',
      medical_referral: 'ENT / Medical Specialist Referral',
      wax_cleared: 'Cerumen Removal Completed',
      other: 'Appointment Outcome Recorded',
    };

    leadService.recordActivity({
      organization_id: orgId,
      contact_id: appt.contact_id,
      inquiry_id: appt.inquiry_id,
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
    const appt = await this.getAppointment(orgId, appointmentId);
    if (!appt) throw new Error('Appointment not found');

    appt.status = 'cancelled';
    appt.outcome_notes = `Cancelled: ${reason}`;
    appt.updated_at = new Date().toISOString();

    leadService.recordActivity({
      organization_id: orgId,
      contact_id: appt.contact_id,
      inquiry_id: appt.inquiry_id,
      activity_type: 'note',
      title: 'Appointment Cancelled',
      content: `Cancelled: "${appt.title}". Reason: ${reason}`,
    });

    return appt;
  }

  public async markNoShow(
    orgId: string,
    appointmentId: string
  ): Promise<Appointment> {
    const appt = await this.getAppointment(orgId, appointmentId);
    if (!appt) throw new Error('Appointment not found');

    appt.status = 'no_show';
    appt.updated_at = new Date().toISOString();

    // Auto-create urgent follow-up task
    taskService.createTask({
      organizationId: orgId,
      contactId: appt.contact_id,
      inquiryId: appt.inquiry_id,
      contactName: appt.title,
      title: `No-Show Follow-up: Rebook ${appt.title}`,
      description: `Patient did not attend scheduled appointment on ${new Date(appt.start_time).toLocaleDateString('en-ZA')}. Contact immediately to reschedule.`,
      taskType: 'follow_up_call',
      priority: 'high',
      dueAt: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
    });

    leadService.recordActivity({
      organization_id: orgId,
      contact_id: appt.contact_id,
      inquiry_id: appt.inquiry_id,
      activity_type: 'note',
      title: 'Appointment No-Show',
      content: `Patient missed scheduled appointment "${appt.title}". High-priority rebooking task created.`,
    });

    return appt;
  }

  // --- External Calendar Reconciliation ---

  public async reconcileExternalBooking(
    orgId: string,
    payload: ExternalBookingPayload
  ): Promise<{
    status: 'existing' | 'matched' | 'unmatched';
    appointment?: Appointment;
    unmatchedBooking?: UnmatchedBooking;
    reason?: 'no_match' | 'multiple_candidates';
  }> {
    // 1. Idempotency Check: if external_calendar_id already exists for this org, return existing
    const existing = this.appointments.find(
      (a) => a.organization_id === orgId && a.external_calendar_id === payload.external_calendar_id
    );
    if (existing) {
      return { status: 'existing', appointment: existing };
    }

    // 2. Candidate Matching via normalized phone and email
    const normPhone = payload.attendee_phone ? normalizePhone(payload.attendee_phone) : null;
    const normEmail = payload.attendee_email ? normalizeEmail(payload.attendee_email) : null;

    const matchedContacts = leadService.findContactsByOrg(orgId).filter((contact) => {
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
        organization_id: orgId,
        contact_id: contact.id,
        inquiry_id: latestInquiry?.id,
        location_id: payload.location_id,
        title: payload.title,
        appointment_type: payload.appointment_type || 'consultation',
        start_time: payload.start_time,
        end_time: payload.end_time,
        external_calendar_id: payload.external_calendar_id,
        external_provider: payload.external_provider,
      });

      return { status: 'matched', appointment };
    }

    // 4. Zero matches or Ambiguous multiple matches -> Dispatch to Unmatched Booking Review Queue
    const unmatchedRecord: UnmatchedBooking = {
      id: `unmatched-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      organization_id: orgId,
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

    this.unmatchedBookings.push(unmatchedRecord);

    return {
      status: 'unmatched',
      unmatchedBooking: unmatchedRecord,
      reason: matchedContacts.length === 0 ? 'no_match' : 'multiple_candidates',
    };
  }

  public async listUnmatchedBookings(
    orgId: string,
    status?: 'pending' | 'matched' | 'created_new' | 'ignored'
  ): Promise<UnmatchedBooking[]> {
    return this.unmatchedBookings
      .filter((u) => u.organization_id === orgId && (!status || u.resolution_status === status))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public async resolveUnmatchedBooking(
    orgId: string,
    unmatchedId: string,
    action: 'match_existing' | 'create_new' | 'ignore',
    targetContactId?: string
  ): Promise<{ unmatched: UnmatchedBooking; appointment?: Appointment }> {
    const item = this.unmatchedBookings.find(
      (u) => u.organization_id === orgId && u.id === unmatchedId
    );
    if (!item) throw new Error('Unmatched booking not found');

    if (action === 'ignore') {
      item.resolution_status = 'ignored';
      item.updated_at = new Date().toISOString();
      return { unmatched: item };
    }

    let contactId = targetContactId;

    if (action === 'create_new') {
      const parts = (item.attendee_name || 'Calendar Attendee').trim().split(' ');
      const firstName = parts[0] || 'Unknown';
      const lastName = parts.slice(1).join(' ') || '';

      const created = await leadService.createLead({
        organization_id: orgId,
        first_name: firstName,
        last_name: lastName,
        email: item.attendee_email,
        phone: item.attendee_phone,
        source: 'portal',
        status: 'appointment_booked',
        notes: `Created from reconciled external calendar booking: "${item.title}" (${item.external_provider})`,
      });
      contactId = created.contact.id;
      item.resolution_status = 'created_new';
    } else {
      if (!contactId) throw new Error('Target contact ID required for matching');
      item.resolution_status = 'matched';
    }

    item.resolved_contact_id = contactId;
    item.updated_at = new Date().toISOString();

    const appt = await this.createAppointment({
      organization_id: orgId,
      contact_id: contactId,
      title: item.title,
      start_time: item.start_time,
      end_time: item.end_time,
      external_calendar_id: item.external_calendar_id,
      external_provider: item.external_provider,
    });

    return { unmatched: item, appointment: appt };
  }
}

export const appointmentService = new AppointmentService();
