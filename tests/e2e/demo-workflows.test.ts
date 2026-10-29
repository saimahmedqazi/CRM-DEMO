import { describe, it, expect, beforeEach } from "vitest";
import { persistentDemoStore } from "@/lib/db/persistent-demo-store";
import { leadService } from "@/lib/services/lead-service";
import { appointmentService } from "@/lib/services/appointment-service";
import { taskService } from "@/lib/services/task-service";
import { analyticsService } from "@/lib/services/analytics-service";
import { WebhookVerifier } from "@/lib/integrations/webhook-verifier";

describe("Hoffman Audiology End-to-End Sales Demo Workflows", () => {
  const ORG_ID = "org-hoffman-01";
  const OTHER_ORG_ID = "org-apex-dental-02";

  beforeEach(() => {
    // Reset to pristine 100% synthetic seed state before each test
    persistentDemoStore.resetToDefault();
    WebhookVerifier.clearIdempotencyStore();
  });

  describe("1. Synthetic Data Verification & Sanitization", () => {
    it("ensures all seed contacts, phones, and emails are 100% synthetic demonstration data", () => {
      const data = persistentDemoStore.getData();

      expect(data.contacts.length).toBeGreaterThanOrEqual(5);

      data.contacts.forEach((contact) => {
        // Must use synthetic demo email domain
        if (contact.email) {
          expect(contact.email).toMatch(/@demo\.example\.co\.za$/);
        }
        // Must use non-routable / test phone block (+27 82 000 01XX)
        if (contact.phone) {
          expect(contact.phone).toMatch(/^\+27 82 000 01\d{2}$/);
        }
        // Name must clearly indicate demo persona
        expect(contact.first_name).toContain("(Demo)");
      });

      // Must have confirmed synthetic revenue in ZAR
      const totalRev = data.appointments.reduce((sum, a) => sum + (a.revenue_cents || 0), 0);
      expect(totalRev).toBe(3865000); // R38,650.00
    });
  });

  describe("2. Public Lead Form Ingestion & Security", () => {
    it("creates synthetic lead via public form input and assigns proper tags", () => {
      const result = leadService.createLead({
        organization_id: ORG_ID,
        first_name: "Test Patient (Demo)",
        last_name: "Khumalo",
        phone: "+27 82 000 0199",
        email: "test.khumalo@demo.example.co.za",
        location_id: "loc-dbn-01",
        source: "website",
        priority: "medium",
        notes: "Patient submitted booking request via website embed form.",
        tags: ["Website Embed Form", "Diagnostic Audiogram"],
        staffName: "Website Embed Form",
      });

      expect(result.contact.id).toBeDefined();
      expect(result.inquiry.id).toBeDefined();
      expect(result.inquiry.status).toBe("new");
      expect(result.inquiry.source).toBe("website");

      // Verify lead appears in inbox query
      const inbox = leadService.getInquiries({ orgId: ORG_ID, search: "Khumalo" });
      expect(inbox.inquiries.length).toBe(1);
      expect(inbox.inquiries[0].contactName).toBe("Test Patient (demo) Khumalo");
    });

    it("deduplicates repeat inquiries from the same phone number", () => {
      // First submission
      const first = leadService.createLead({
        organization_id: ORG_ID,
        first_name: "Repeat Patient (Demo)",
        last_name: "Naidoo",
        phone: "+27 82 000 0188",
        source: "website",
      });
      expect(first.isExistingContact).toBe(false);

      // Second submission with same phone
      const second = leadService.createLead({
        organization_id: ORG_ID,
        first_name: "Repeat Patient (Demo)",
        last_name: "Naidoo",
        phone: "+27 82 000 0188",
        source: "whatsapp",
        notes: "Second follow-up query",
      });

      expect(second.isExistingContact).toBe(true);
      expect(second.contact.id).toBe(first.contact.id);
      expect(second.inquiry.id).not.toBe(first.inquiry.id);
    });
  });

  describe("3. Lead Lifecycle & Pipeline Progression", () => {
    it("advances lead through pipeline stages and updates activity history", () => {
      const { inquiry, contact } = leadService.createLead({
        organization_id: ORG_ID,
        first_name: "Pipeline Candidate (Demo)",
        phone: "+27 82 000 0177",
        source: "phone",
      });

      expect(inquiry.status).toBe("new");

      // Advance: new -> contacted
      leadService.updateInquiryStatus(ORG_ID, inquiry.id, "contacted", undefined, "Dr. Kara Hoffman");
      let updated = leadService.getInquiries({ orgId: ORG_ID, search: "Pipeline Candidate" });
      expect(updated.inquiries[0].status).toBe("contacted");

      // Advance: contacted -> follow_up_needed
      leadService.updateInquiryStatus(ORG_ID, inquiry.id, "follow_up_needed", undefined, "Dr. Kara Hoffman");
      updated = leadService.getInquiries({ orgId: ORG_ID, search: "Pipeline Candidate" });
      expect(updated.inquiries[0].status).toBe("follow_up_needed");

      // Verify activity audit trail
      const timeline = leadService.getContactWithTimeline(ORG_ID, contact.id);
      expect(timeline?.activities.length).toBeGreaterThanOrEqual(3);
    });

    it("records documented loss reason when lead is marked as lost", () => {
      const { inquiry } = leadService.createLead({
        organization_id: ORG_ID,
        first_name: "Lost Lead (Demo)",
        phone: "+27 82 000 0166",
        source: "meta_ads",
      });

      leadService.updateInquiryStatus(
        ORG_ID,
        inquiry.id,
        "lost",
        "pricing_too_high",
        "Dr. Kara Hoffman"
      );

      const updated = leadService.getInquiries({ orgId: ORG_ID, search: "Lost Lead" });
      expect(updated.inquiries[0].status).toBe("lost");
      expect(updated.inquiries[0].loss_reason).toBe("pricing_too_high");
    });
  });

  describe("4. Task SLA & Daily Action Queue", () => {
    it("sorts daily action queue into overdue, due today, and upcoming", () => {
      const queue = taskService.getDailyActionQueue(ORG_ID);

      expect(queue.overdue.length).toBeGreaterThanOrEqual(1);
      expect(queue.dueToday.length).toBeGreaterThanOrEqual(1);
      expect(queue.upcoming.length).toBeGreaterThanOrEqual(1);

      // Overdue task must have due_at in the past
      const now = new Date();
      queue.overdue.forEach((task) => {
        expect(new Date(task.due_at).getTime()).toBeLessThan(now.getTime());
      });
    });

    it("completes a task and records completion in timeline", () => {
      const queue = taskService.getDailyActionQueue(ORG_ID);
      const targetTask = queue.overdue[0];

      const ok = taskService.completeTask(
        ORG_ID,
        targetTask.id,
        "Completed callback with patient. Booked assessment slot.",
        "Dr. Kara Hoffman"
      );
      expect(ok).toBe(true);

      const refreshed = taskService.getDailyActionQueue(ORG_ID);
      expect(refreshed.overdue.some((t) => t.id === targetTask.id)).toBe(false);
      expect(refreshed.completedToday.some((t) => t.id === targetTask.id)).toBe(true);
    });
  });

  describe("5. Appointments, Clinical Outcomes & Revenue Reconciliation", () => {
    it("creates an appointment, advances inquiry stage, and records verified revenue outcome", async () => {
      const { contact, inquiry } = leadService.createLead({
        organization_id: ORG_ID,
        first_name: "Appointment Patient (Demo)",
        phone: "+27 82 000 0155",
        source: "website",
      });

      // 1. Create Appointment
      const appt = await appointmentService.createAppointment({
        organization_id: ORG_ID,
        contact_id: contact.id,
        inquiry_id: inquiry.id,
        location_id: "loc-blt-01",
        title: "Hearing Aid Evaluation - Ballito Clinic",
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 3600 * 1000).toISOString(),
      });

      expect(appt.id).toBeDefined();
      expect(appt.status).toBe("scheduled");

      // Verify inquiry was moved to appointment_booked
      const inqUpdated = leadService.getInquiries({ orgId: ORG_ID, search: "Appointment Patient" });
      expect(inqUpdated.inquiries[0].status).toBe("appointment_booked");

      // 2. Record Outcome: Hearing Aid Fitted (R42,000 ZAR)
      const outcomeAppt = await appointmentService.recordOutcome(
        ORG_ID,
        appt.id,
        "hearing_aid_fitted",
        "Fitted binaural Oticon Intent hearing aids. Patient verified clarity.",
        4200000 // R42,000.00
      );

      expect(outcomeAppt.status).toBe("attended");
      expect(outcomeAppt.outcome).toBe("hearing_aid_fitted");
      expect(outcomeAppt.revenue_cents).toBe(4200000);

      // Verify inquiry was moved to completed
      const inqCompleted = leadService.getInquiries({ orgId: ORG_ID, search: "Appointment Patient" });
      expect(inqCompleted.inquiries[0].status).toBe("completed");
    });

    it("reconciles external calendar booking idempotently", async () => {
      // Reconcile an existing contact
      const res = await appointmentService.reconcileExternalBooking(ORG_ID, {
        external_calendar_id: "gcal_sync_test_001",
        external_provider: "google_calendar",
        title: "Audiogram Check - Deon van der Merwe (Demo)",
        attendee_name: "Deon (Demo) van der Merwe",
        attendee_phone: "+27 82 000 0102",
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 3600 * 1000).toISOString(),
      });

      expect(res.status).toBe("matched");
      expect(res.appointment).toBeDefined();

      // Second identical sync call must be idempotent
      const replay = await appointmentService.reconcileExternalBooking(ORG_ID, {
        external_calendar_id: "gcal_sync_test_001",
        external_provider: "google_calendar",
        title: "Audiogram Check - Deon van der Merwe (Demo)",
        attendee_name: "Deon (Demo) van der Merwe",
        attendee_phone: "+27 82 000 0102",
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 3600 * 1000).toISOString(),
      });

      expect(replay.status).toBe("existing");
      expect(replay.appointment?.id).toBe(res.appointment?.id);
    });
  });

  describe("6. Real-time Conversion & Attribution Analytics", () => {
    it("calculates real-time metrics, conversion funnel, and channel revenue from persistent store", async () => {
      const metrics = await analyticsService.getExecutiveDashboardMetrics(ORG_ID);

      expect(metrics.totalInquiries).toBeGreaterThanOrEqual(8);
      expect(metrics.totalBooked).toBeGreaterThanOrEqual(3);
      expect(metrics.totalAttended).toBeGreaterThanOrEqual(2);
      expect(metrics.totalRevenueCents).toBeGreaterThanOrEqual(3865000); // >= R38,650
      expect(metrics.overallConversionRate).toBeGreaterThan(0);

      // Funnel stages must be ordered
      expect(metrics.funnelStages[0].id).toBe("new");
      expect(metrics.funnelStages[1].id).toBe("contacted");
      expect(metrics.funnelStages[2].id).toBe("booked");

      // Channel attribution must show revenue
      const phoneChannel = metrics.channels.find((c) => c.source === "phone");
      expect(phoneChannel).toBeDefined();
      expect(phoneChannel?.revenueCents).toBe(3800000); // R38,000 for Deon
    });
  });

  describe("7. Multi-Tenant Strict Isolation", () => {
    it("ensures records from Hoffman Audiology are invisible to another organization", () => {
      // Create record in Hoffman Audiology
      leadService.createLead({
        organization_id: ORG_ID,
        first_name: "Hoffman Patient",
        phone: "+27 82 000 0144",
        source: "phone",
      });

      // Query from Apex Dental Practice
      const apexInquiries = leadService.getInquiries({
        orgId: OTHER_ORG_ID,
      });

      // Must find 0 records
      expect(apexInquiries.inquiries.length).toBe(0);
      expect(apexInquiries.totalCount).toBe(0);

      const apexTasks = taskService.getDailyActionQueue(OTHER_ORG_ID);
      expect(apexTasks.overdue.length).toBe(0);
      expect(apexTasks.dueToday.length).toBe(0);
    });
  });

  describe("8. Demo Reset Capability", () => {
    it("restores the store back to the clean synthetic baseline after test modifications", () => {
      // Mutate state
      leadService.createLead({
        organization_id: ORG_ID,
        first_name: "Temporary Demo Lead",
        phone: "+27 82 000 0133",
        source: "walk_in",
      });

      let inq = leadService.getInquiries({ orgId: ORG_ID, search: "Temporary Demo Lead" });
      expect(inq.totalCount).toBe(1);

      // Perform reset
      persistentDemoStore.resetToDefault();

      // Verify temporary record is gone and seed baseline is restored
      inq = leadService.getInquiries({ orgId: ORG_ID, search: "Temporary Demo Lead" });
      expect(inq.totalCount).toBe(0);

      const seedData = persistentDemoStore.getData();
      expect(seedData.contacts.length).toBe(8);
      expect(seedData.inquiries.length).toBe(8);
    });
  });
});
