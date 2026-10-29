import { leadService } from "@/lib/services/lead-service";
import { appointmentService } from "@/lib/services/appointment-service";
import { taskService } from "@/lib/services/task-service";

export interface DemoWorkspaceDetails {
  organizationId: string;
  name: string;
  owner: string;
  locations: Array<{ id: string; name: string; city: string; phone: string }>;
  seedSummary: {
    contactsCreated: number;
    inquiriesCreated: number;
    appointmentsCreated: number;
    tasksCreated: number;
    totalRevenueZar: number;
  };
}

export async function seedHoffmanAudiologyDemo(): Promise<DemoWorkspaceDetails> {
  const orgId = "org-hoffman-01";

  // 1. Clear & Seed Multi-Channel Patient Inquiries
  const p1 = leadService.createLead({
    organization_id: orgId,
    first_name: "Gugulethu",
    last_name: "Zuma",
    email: "gugu.zuma@workmail.co.za",
    phone: "082 455 1029",
    location_id: "loc-dbn-01",
    source: "website",
    priority: "urgent",
    notes: "Sudden onset hearing loss in right ear over the weekend. Patient requests urgent diagnostic audiogram in Durban.",
    tags: ["Urgent Intake", "Durban Musgrave", "Diagnostic Assessment"],
    staffName: "Website Embed Form",
  });

  const p2 = leadService.createLead({
    organization_id: orgId,
    first_name: "Deon",
    last_name: "van der Merwe",
    email: "deon.vdm@coastalnet.co.za",
    phone: "083 912 3344",
    location_id: "loc-blt-01",
    source: "phone",
    priority: "medium",
    notes: "Ballito resident inquiring about upgrading Oticon More hearing aids to new Oticon Intent platform. Pensioner.",
    tags: ["Hearing Aid Upgrade", "Ballito Clinic", "Oticon Intent"],
    staffName: "Reception Phone Desk",
  });

  const p3 = leadService.createLead({
    organization_id: orgId,
    first_name: "Fatima",
    last_name: "Patel",
    email: "fatima.patel@telkomsa.net",
    phone: "072 104 8899",
    location_id: "loc-dbn-01",
    source: "whatsapp",
    priority: "high",
    notes: "Inquired via WhatsApp asking for ear wax removal pricing and Saturday morning availability in Durban.",
    tags: ["WhatsApp Business", "Cerumen Removal", "Saturday Slot"],
    staffName: "Meta WhatsApp Cloud API",
  });

  const p4 = leadService.createLead({
    organization_id: orgId,
    first_name: "Brandon",
    last_name: "Naicker",
    email: "brandon.naicker@gmail.com",
    phone: "084 555 7812",
    location_id: "loc-blt-01",
    source: "meta_ads",
    priority: "medium",
    notes: "Submitted Facebook Instant Lead Ad: 'Free Tinnitus & Hearing Assessment Ballito'.",
    tags: ["Meta Ads", "Tinnitus Campaign", "Ballito"],
    staffName: "Meta Graph API",
  });

  const p5 = leadService.createLead({
    organization_id: orgId,
    first_name: "Sipho",
    last_name: "Cele",
    phone: "084 777 1234",
    location_id: "loc-dbn-01",
    source: "phone",
    priority: "urgent",
    notes: "Missed phone call to Durban Musgrave clinic line. Urgent callback required within 2h SLA.",
    tags: ["Missed Call", "Urgent Callback", "Durban Musgrave"],
    staffName: "Telecom PBX Trunk",
  });

  // 2. Schedule Appointments & Record Clinical Outcomes
  // Confirmed Hearing Aid Fitting for Deon (Ballito) -> R38,000
  const appt1 = await appointmentService.createAppointment({
    organization_id: orgId,
    contact_id: p2.contact.id,
    inquiry_id: p2.inquiry.id,
    location_id: "loc-blt-01",
    title: "Oticon Intent Binaural Fitting - Deon van der Merwe",
    appointment_type: "hearing_aid_fitting",
    start_time: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    end_time: new Date(Date.now() - 23 * 3600 * 1000).toISOString(),
  });
  await appointmentService.recordOutcome(
    orgId,
    appt1.id,
    "hearing_aid_fitted",
    "Binaural Oticon Intent 1 fitted with custom micro-moulds. Real-ear measurements verified. Exceptional speech-in-noise perception demonstrated.",
    3800000 // R38,000.00
  );

  // Completed Microsuction Wax Removal for Fatima (Durban) -> R650
  const appt2 = await appointmentService.createAppointment({
    organization_id: orgId,
    contact_id: p3.contact.id,
    inquiry_id: p3.inquiry.id,
    location_id: "loc-dbn-01",
    title: "Microsuction Cerumen Removal - Fatima Patel",
    appointment_type: "wax_removal",
    start_time: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    end_time: new Date(Date.now() - 47.5 * 3600 * 1000).toISOString(),
  });
  await appointmentService.recordOutcome(
    orgId,
    appt2.id,
    "wax_cleared",
    "Bilateral cerumen impaction removed safely via gentle suction. Normal tympanic membrane visualized.",
    65000 // R650.00
  );

  // Scheduled Diagnostic Audiogram for Gugulethu (Durban)
  await appointmentService.createAppointment({
    organization_id: orgId,
    contact_id: p1.contact.id,
    inquiry_id: p1.inquiry.id,
    location_id: "loc-dbn-01",
    title: "Diagnostic Pure-Tone Audiometry - Gugulethu Zuma",
    appointment_type: "hearing_assessment",
    start_time: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
    end_time: new Date(Date.now() + 5 * 3600 * 1000).toISOString(),
  });

  // 3. Seed Follow-up Tasks in Daily Action Queue
  taskService.createTask({
    organizationId: orgId,
    contactId: p5.contact.id,
    inquiryId: p5.inquiry.id,
    contactName: "Sipho Cele",
    contactPhone: "084 777 1234",
    locationId: "loc-dbn-01",
    title: "Return Missed Call from Sipho Cele",
    description: "Missed call to Durban Musgrave clinic line. High priority 2h response SLA.",
    taskType: "follow_up_call",
    priority: "urgent",
    dueAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  });

  taskService.createTask({
    organizationId: orgId,
    contactId: p4.contact.id,
    inquiryId: p4.inquiry.id,
    contactName: "Brandon Naicker",
    contactPhone: "084 555 7812",
    locationId: "loc-blt-01",
    title: "Call Brandon: Tinnitus Screening Inquiry",
    description: "Follow up on Facebook Lead Ad submission for Ballito clinic screening.",
    taskType: "follow_up_call",
    priority: "high",
    dueAt: new Date(Date.now() + 90 * 60 * 1000).toISOString(),
  });

  return {
    organizationId: orgId,
    name: "Hoffman Audiology Inc.",
    owner: "Dr. Kara Hoffman (M.Aud, Pr.No: 082001)",
    locations: [
      {
        id: "loc-dbn-01",
        name: "Durban Clinic (Musgrave)",
        city: "Durban, KwaZulu-Natal",
        phone: "+27 31 201 4455",
      },
      {
        id: "loc-blt-01",
        name: "Ballito Clinic (The Well)",
        city: "Ballito, KwaZulu-Natal",
        phone: "+27 32 946 1122",
      },
    ],
    seedSummary: {
      contactsCreated: 5,
      inquiriesCreated: 5,
      appointmentsCreated: 3,
      tasksCreated: 2,
      totalRevenueZar: 38650.0,
    },
  };
}
