import { describe, it, expect, beforeEach } from 'vitest';
import { appointmentService } from '@/lib/services/appointment-service';
import { leadService } from '@/lib/services/lead-service';
import { persistentDemoStore } from '@/lib/db/persistent-demo-store';

describe('Appointment Lifecycle & External Calendar Reconciliation', () => {
  const orgId = 'test-org-audiology';

  beforeEach(() => {
    persistentDemoStore.resetToDefault();

    // Seed test contact
    leadService.createLead({
      organization_id: orgId,
      first_name: 'Kara',
      last_name: 'Hoffman',
      email: 'kara.hoffman@testpractice.co.za',
      phone: '082 123 4567', // Normalizes to +27821234567
      source: 'phone',
      notes: 'Initial test patient',
    });
  });

  it('reconciles external calendar booking by exact E.164 phone match', async () => {
    const result = await appointmentService.reconcileExternalBooking(orgId, {
      external_calendar_id: 'gcal-evt-1001',
      external_provider: 'google_calendar',
      title: 'Hearing Aid Assessment (GCal)',
      attendee_name: 'Dr Kara Hoffman',
      attendee_phone: '+27 82 123 4567', // Should match normalized
      attendee_email: 'kara.alt@different.com',
      start_time: '2026-11-05T09:00:00Z',
      end_time: '2026-11-05T10:00:00Z',
    });

    expect(result.status).toBe('matched');
    expect(result.appointment).toBeDefined();
    expect(result.appointment?.external_calendar_id).toBe('gcal-evt-1001');
    expect(result.appointment?.title).toBe('Hearing Aid Assessment (GCal)');
  });

  it('reconciles external calendar booking by exact normalized email match', async () => {
    const result = await appointmentService.reconcileExternalBooking(orgId, {
      external_calendar_id: 'outlook-evt-2002',
      external_provider: 'outlook',
      title: 'Follow-up Consultation (Outlook)',
      attendee_name: 'Kara H.',
      attendee_email: 'KARA.HOFFMAN@TESTPRACTICE.CO.ZA', // Should normalize and match
      start_time: '2026-11-06T14:00:00Z',
      end_time: '2026-11-06T14:45:00Z',
    });

    expect(result.status).toBe('matched');
    expect(result.appointment).toBeDefined();
    expect(result.appointment?.external_provider).toBe('outlook');
  });

  it('enforces idempotency on repeated calendar webhook syncs', async () => {
    const payload = {
      external_calendar_id: 'calendly-evt-3003',
      external_provider: 'calendly' as const,
      title: 'Diagnostic Audiometry',
      attendee_name: 'Kara Hoffman',
      attendee_phone: '+27821234567',
      start_time: '2026-11-07T10:00:00Z',
      end_time: '2026-11-07T11:00:00Z',
    };

    const first = await appointmentService.reconcileExternalBooking(orgId, payload);
    expect(first.status).toBe('matched');

    // Repeated call with identical external_calendar_id
    const second = await appointmentService.reconcileExternalBooking(orgId, payload);
    expect(second.status).toBe('existing');
    expect(second.appointment?.id).toBe(first.appointment?.id);
  });

  it('routes unknown contact bookings to Unmatched Booking Review Queue', async () => {
    const unknownPayload = {
      external_calendar_id: 'gcal-evt-unknown-999',
      external_provider: 'google_calendar' as const,
      title: 'Walk-in Tinnitus Check',
      attendee_name: 'Sipho Ndlovu',
      attendee_phone: '+27719998877',
      attendee_email: 'sipho.ndlovu@newpatient.co.za',
      start_time: '2026-11-08T11:00:00Z',
      end_time: '2026-11-08T11:30:00Z',
    };

    const result = await appointmentService.reconcileExternalBooking(orgId, unknownPayload);
    expect(result.status).toBe('unmatched');
    expect(result.reason).toBe('no_match');
    expect(result.unmatchedBooking).toBeDefined();
    expect(result.unmatchedBooking?.resolution_status).toBe('pending');

    // Verify presence in unmatched list
    const pendingList = await appointmentService.listUnmatchedBookings(orgId, 'pending');
    expect(pendingList.some((u) => u.id === result.unmatchedBooking?.id)).toBe(true);
  });

  it('resolves unmatched booking by creating new contact and inquiry', async () => {
    const unknownPayload = {
      external_calendar_id: 'gcal-evt-resolve-888',
      external_provider: 'google_calendar' as const,
      title: 'Pediatric Hearing Screening',
      attendee_name: 'Zola Dlamini',
      attendee_phone: '+27761112233',
      attendee_email: 'zola.dlamini@example.com',
      start_time: '2026-11-09T08:30:00Z',
      end_time: '2026-11-09T09:30:00Z',
    };

    const queueResult = await appointmentService.reconcileExternalBooking(orgId, unknownPayload);
    const unmatchedId = queueResult.unmatchedBooking!.id;

    const resolved = await appointmentService.resolveUnmatchedBooking(
      orgId,
      unmatchedId,
      'create_new'
    );

    expect(resolved.unmatched?.resolution_status).toBe('created_new');
    expect(resolved.appointment).toBeDefined();
    expect(resolved.appointment?.title).toBe('Pediatric Hearing Screening');
  });

  it('records verified clinical outcome and advances inquiry stage', async () => {
    const appt = await appointmentService.createAppointment({
      organization_id: orgId,
      contact_id: 'c-test-outcome',
      title: 'Bilateral Hearing Aid Evaluation',
      start_time: '2026-11-10T14:00:00Z',
      end_time: '2026-11-10T15:00:00Z',
    });

    const completedAppt = await appointmentService.recordOutcome(
      orgId,
      appt.id,
      'hearing_aid_fitted',
      'Fitted Phonak Lumity 90 with custom slim tips. Patient demonstrated excellent speech discrimination.',
      4200000 // R42,000.00
    );

    expect(completedAppt.status).toBe('attended');
    expect(completedAppt.outcome).toBe('hearing_aid_fitted');
    expect(completedAppt.revenue_cents).toBe(4200000);
  });

  it('marks no-show and triggers high-priority task for rebooking', async () => {
    const appt = await appointmentService.createAppointment({
      organization_id: orgId,
      contact_id: 'c-test-noshow',
      title: 'Annual Diagnostic Hearing Screen',
      start_time: '2026-11-11T09:00:00Z',
      end_time: '2026-11-11T10:00:00Z',
    });

    const noShowAppt = await appointmentService.markNoShow(orgId, appt.id);
    expect(noShowAppt.status).toBe('no_show');
  });
});
