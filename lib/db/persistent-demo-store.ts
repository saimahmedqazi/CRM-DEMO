import fs from "fs";
import path from "path";

export interface DemoContact {
  id: string;
  organization_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  phone_normalized: string | null;
  preferred_location_id: string | null;
  custom_fields: Record<string, any>;
  tags: string[];
  last_interaction_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DemoInquiry {
  id: string;
  organization_id: string;
  contact_id: string;
  location_id: string | null;
  source: string;
  status: string;
  priority: string;
  notes: string | null;
  loss_reason?: string | null;
  loss_notes?: string | null;
  assigned_user_id: string | null;
  custom_fields: Record<string, any>;
  tags: string[];
  last_interaction_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DemoActivity {
  id: string;
  organization_id: string;
  contact_id: string;
  inquiry_id?: string | null;
  staff_name: string;
  activity_type: string;
  title: string;
  description: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export interface DemoAppointment {
  id: string;
  organization_id: string;
  contact_id: string;
  inquiry_id?: string;
  location_id?: string;
  title: string;
  appointment_type: string;
  start_time: string;
  end_time: string;
  status: string;
  outcome?: string;
  outcome_notes?: string;
  revenue_cents?: number;
  external_calendar_id?: string;
  external_provider?: string;
  created_at: string;
  updated_at: string;
}

export interface DemoUnmatchedBooking {
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
  resolution_status: "pending" | "matched" | "created_new" | "ignored";
  resolved_contact_id?: string;
  created_at: string;
  updated_at: string;
}

export interface DemoTask {
  id: string;
  organization_id: string;
  contact_id: string;
  inquiry_id?: string | null;
  assigned_user_id?: string | null;
  contactName: string;
  contactPhone?: string | null;
  locationId?: string | null;
  title: string;
  description: string | null;
  task_type: string;
  priority: "low" | "medium" | "high" | "urgent";
  due_at: string;
  completed_at?: string | null;
  is_completed: boolean;
  outcome_notes?: string | null;
  created_at: string;
}

export interface DemoStoreData {
  contacts: DemoContact[];
  inquiries: DemoInquiry[];
  activities: DemoActivity[];
  appointments: DemoAppointment[];
  unmatched_bookings: DemoUnmatchedBooking[];
  tasks: DemoTask[];
}

/**
 * Creates the pristine, 100% synthetic Hoffman Audiology demonstration dataset.
 * All phone numbers, emails, names, notes, and values are fictional demonstration data.
 */
export function buildSyntheticDemoSeed(): DemoStoreData {
  const orgId = "org-hoffman-01";
  const now = new Date();
  const isoNow = now.toISOString();

  // Synthetic Contacts
  const contacts: DemoContact[] = [
    {
      id: "cnt-demo-01",
      organization_id: orgId,
      first_name: "Gugulethu (Demo)",
      last_name: "Zuma",
      email: "gugulethu.zuma@demo.example.co.za",
      phone: "+27 82 000 0101",
      phone_normalized: "+27820000101",
      preferred_location_id: "loc-dbn-01",
      custom_fields: { persona: "Diagnostic Hearing Assessment Intake" },
      tags: ["Demo Lead", "Urgent Intake", "Durban Musgrave", "Diagnostic Assessment"],
      created_at: new Date(now.getTime() - 18 * 3600 * 1000).toISOString(),
      updated_at: isoNow,
    },
    {
      id: "cnt-demo-02",
      organization_id: orgId,
      first_name: "Deon (Demo)",
      last_name: "van der Merwe",
      email: "deon.vdm@demo.example.co.za",
      phone: "+27 82 000 0102",
      phone_normalized: "+27820000102",
      preferred_location_id: "loc-blt-01",
      custom_fields: { persona: "Hearing Aid Upgrade Candidate" },
      tags: ["Demo Patient", "Hearing Aid Upgrade", "Ballito Clinic", "Oticon Intent"],
      created_at: new Date(now.getTime() - 48 * 3600 * 1000).toISOString(),
      updated_at: isoNow,
    },
    {
      id: "cnt-demo-03",
      organization_id: orgId,
      first_name: "Fatima (Demo)",
      last_name: "Patel",
      email: "fatima.patel@demo.example.co.za",
      phone: "+27 82 000 0103",
      phone_normalized: "+27820000103",
      preferred_location_id: "loc-dbn-01",
      custom_fields: { persona: "Microsuction Wax Removal" },
      tags: ["Demo Patient", "WhatsApp Inbound", "Cerumen Removal", "Saturday Slot"],
      created_at: new Date(now.getTime() - 72 * 3600 * 1000).toISOString(),
      updated_at: isoNow,
    },
    {
      id: "cnt-demo-04",
      organization_id: orgId,
      first_name: "Brandon (Demo)",
      last_name: "Naicker",
      email: "brandon.naicker@demo.example.co.za",
      phone: "+27 82 000 0104",
      phone_normalized: "+27820000104",
      preferred_location_id: "loc-blt-01",
      custom_fields: { persona: "Meta Ads Tinnitus Screening" },
      tags: ["Demo Lead", "Meta Ads", "Tinnitus Campaign", "Ballito"],
      created_at: new Date(now.getTime() - 6 * 3600 * 1000).toISOString(),
      updated_at: isoNow,
    },
    {
      id: "cnt-demo-05",
      organization_id: orgId,
      first_name: "Sipho (Demo)",
      last_name: "Cele",
      email: "sipho.cele@demo.example.co.za",
      phone: "+27 82 000 0105",
      phone_normalized: "+27820000105",
      preferred_location_id: "loc-dbn-01",
      custom_fields: { persona: "Missed Call Intake" },
      tags: ["Demo Lead", "Missed Call", "Urgent Callback", "Durban Musgrave"],
      created_at: new Date(now.getTime() - 1 * 3600 * 1000).toISOString(),
      updated_at: isoNow,
    },
    {
      id: "cnt-demo-06",
      organization_id: orgId,
      first_name: "Annelize (Demo)",
      last_name: "Botha",
      email: "annelize.botha@demo.example.co.za",
      phone: "+27 82 000 0106",
      phone_normalized: "+27820000106",
      preferred_location_id: "loc-blt-01",
      custom_fields: { persona: "GP Referral for Vestibular Testing" },
      tags: ["Demo Lead", "GP Referral", "Vestibular", "Ballito"],
      created_at: new Date(now.getTime() - 36 * 3600 * 1000).toISOString(),
      updated_at: isoNow,
    },
    {
      id: "cnt-demo-07",
      organization_id: orgId,
      first_name: "David (Demo)",
      last_name: "Moodley",
      email: "david.moodley@demo.example.co.za",
      phone: "+27 82 000 0107",
      phone_normalized: "+27820000107",
      preferred_location_id: "loc-dbn-01",
      custom_fields: { persona: "Medical Aid Pricing Query" },
      tags: ["Demo Lead", "Email Inbound", "Medical Aid Query", "Durban"],
      created_at: new Date(now.getTime() - 55 * 3600 * 1000).toISOString(),
      updated_at: isoNow,
    },
    {
      id: "cnt-demo-08",
      organization_id: orgId,
      first_name: "Kavitha (Demo)",
      last_name: "Govender",
      email: "kavitha.govender@demo.example.co.za",
      phone: "+27 82 000 0108",
      phone_normalized: "+27820000108",
      preferred_location_id: "loc-dbn-01",
      custom_fields: { persona: "Instagram Campaign - Budget Sensitive" },
      tags: ["Demo Lead", "Instagram Ads", "Lost Opportunity"],
      created_at: new Date(now.getTime() - 90 * 3600 * 1000).toISOString(),
      updated_at: isoNow,
    },
  ];

  // Synthetic Inquiries across distinct pipeline stages
  const inquiries: DemoInquiry[] = [
    {
      id: "inq-demo-01",
      organization_id: orgId,
      contact_id: "cnt-demo-01",
      location_id: "loc-dbn-01",
      source: "website",
      status: "appointment_booked",
      priority: "urgent",
      notes: "[SYNTHETIC DEMO RECORD] Sudden onset hearing loss in right ear over the weekend. Patient requests urgent diagnostic audiogram in Durban Musgrave.",
      assigned_user_id: "user-kara-hoffman-01",
      custom_fields: { serviceNeeded: "Diagnostic Audiogram", popiaConsented: true },
      tags: ["Demo Lead", "Website Form", "Urgent Intake", "Durban Musgrave"],
      created_at: new Date(now.getTime() - 18 * 3600 * 1000).toISOString(),
      updated_at: isoNow,
    },
    {
      id: "inq-demo-02",
      organization_id: orgId,
      contact_id: "cnt-demo-02",
      location_id: "loc-blt-01",
      source: "phone",
      status: "completed",
      priority: "medium",
      notes: "[SYNTHETIC DEMO RECORD] Ballito resident inquiring about upgrading Oticon More hearing aids to new Oticon Intent platform. Pensioner.",
      assigned_user_id: "user-kara-hoffman-01",
      custom_fields: { hearingAidModel: "Oticon Intent 1" },
      tags: ["Demo Patient", "Hearing Aid Upgrade", "Ballito Clinic", "Oticon Intent"],
      created_at: new Date(now.getTime() - 48 * 3600 * 1000).toISOString(),
      updated_at: isoNow,
    },
    {
      id: "inq-demo-03",
      organization_id: orgId,
      contact_id: "cnt-demo-03",
      location_id: "loc-dbn-01",
      source: "whatsapp",
      status: "completed",
      priority: "high",
      notes: "[SYNTHETIC DEMO RECORD] Inquired via WhatsApp asking for ear wax removal pricing and Saturday morning availability in Durban.",
      assigned_user_id: "user-kara-hoffman-01",
      custom_fields: { channel: "WhatsApp Cloud API Simulator" },
      tags: ["Demo Patient", "WhatsApp Business", "Cerumen Removal", "Saturday Slot"],
      created_at: new Date(now.getTime() - 72 * 3600 * 1000).toISOString(),
      updated_at: isoNow,
    },
    {
      id: "inq-demo-04",
      organization_id: orgId,
      contact_id: "cnt-demo-04",
      location_id: "loc-blt-01",
      source: "meta_ads",
      status: "follow_up_needed",
      priority: "high",
      notes: "[SYNTHETIC DEMO RECORD] Submitted Facebook Instant Lead Ad: 'Free Tinnitus & Hearing Assessment Ballito'.",
      assigned_user_id: "user-kara-hoffman-01",
      custom_fields: { campaign: "Ballito Tinnitus & Screening 2026" },
      tags: ["Demo Lead", "Meta Ads", "Tinnitus Campaign", "Ballito"],
      created_at: new Date(now.getTime() - 6 * 3600 * 1000).toISOString(),
      updated_at: isoNow,
    },
    {
      id: "inq-demo-05",
      organization_id: orgId,
      contact_id: "cnt-demo-05",
      location_id: "loc-dbn-01",
      source: "phone",
      status: "new",
      priority: "urgent",
      notes: "[SYNTHETIC DEMO RECORD] Missed phone call to Durban Musgrave clinic line. Urgent callback required within 2h SLA.",
      assigned_user_id: null,
      custom_fields: { callerNumber: "+27820000105", did: "+27312010001" },
      tags: ["Demo Lead", "Missed Call", "Urgent Callback", "Durban Musgrave"],
      created_at: new Date(now.getTime() - 1 * 3600 * 1000).toISOString(),
      updated_at: isoNow,
    },
    {
      id: "inq-demo-06",
      organization_id: orgId,
      contact_id: "cnt-demo-06",
      location_id: "loc-blt-01",
      source: "referral",
      status: "contacted",
      priority: "medium",
      notes: "[SYNTHETIC DEMO RECORD] GP referral letter received from Dr. Pillay for vestibular assessment. Patient contacted; sent clinic info brochure.",
      assigned_user_id: "user-kara-hoffman-01",
      custom_fields: { referringDoctor: "Dr. K. Pillay" },
      tags: ["Demo Lead", "GP Referral", "Vestibular", "Ballito"],
      created_at: new Date(now.getTime() - 36 * 3600 * 1000).toISOString(),
      updated_at: isoNow,
    },
    {
      id: "inq-demo-07",
      organization_id: orgId,
      contact_id: "cnt-demo-07",
      location_id: "loc-dbn-01",
      source: "email",
      status: "waiting_response",
      priority: "low",
      notes: "[SYNTHETIC DEMO RECORD] Inbound email inquiry requesting Discovery Health medical aid code confirmation for diagnostic assessment.",
      assigned_user_id: "user-kara-hoffman-01",
      custom_fields: { emailSubject: "Audiogram tariff codes query" },
      tags: ["Demo Lead", "Email Inbound", "Medical Aid Query", "Durban"],
      created_at: new Date(now.getTime() - 55 * 3600 * 1000).toISOString(),
      updated_at: isoNow,
    },
    {
      id: "inq-demo-08",
      organization_id: orgId,
      contact_id: "cnt-demo-08",
      location_id: "loc-dbn-01",
      source: "meta_ads",
      status: "lost",
      priority: "low",
      notes: "[SYNTHETIC DEMO RECORD] Inquired via Instagram ad for premium hearing aids. Advised budget did not permit private fitting at this time.",
      loss_reason: "pricing_too_high",
      loss_notes: "Patient budget constraint. Provided info on entry-level models and government tertiary clinic referral.",
      assigned_user_id: "user-kara-hoffman-01",
      custom_fields: { campaign: "Instagram Hearing Care 2026" },
      tags: ["Demo Lead", "Instagram Ads", "Lost Opportunity"],
      created_at: new Date(now.getTime() - 90 * 3600 * 1000).toISOString(),
      updated_at: isoNow,
    },
  ];

  // Activities & Interaction Timeline
  const activities: DemoActivity[] = [
    {
      id: "act-demo-01",
      organization_id: orgId,
      contact_id: "cnt-demo-01",
      inquiry_id: "inq-demo-01",
      staff_name: "Website Lead Form (Simulated)",
      activity_type: "lead_created",
      title: "Inquiry Captured from Website Form",
      description: "Patient submitted booking request for urgent diagnostic audiogram at Durban Musgrave clinic.",
      metadata: { source: "website", priority: "urgent" },
      created_at: new Date(now.getTime() - 18 * 3600 * 1000).toISOString(),
    },
    {
      id: "act-demo-02",
      organization_id: orgId,
      contact_id: "cnt-demo-01",
      inquiry_id: "inq-demo-01",
      staff_name: "Dr. Kara Hoffman",
      activity_type: "status_changed",
      title: "Status Changed: Appointment Booked",
      description: "Confirmed Diagnostic Audiogram booking for tomorrow morning at Durban Musgrave clinic.",
      metadata: { from: "contacted", to: "appointment_booked" },
      created_at: new Date(now.getTime() - 14 * 3600 * 1000).toISOString(),
    },
    {
      id: "act-demo-03",
      organization_id: orgId,
      contact_id: "cnt-demo-02",
      inquiry_id: "inq-demo-02",
      staff_name: "Dr. Kara Hoffman",
      activity_type: "appointment_completed",
      title: "Clinical Outcome Logged: Hearing Aid Fitted",
      description: "Binaural Oticon Intent 1 fitted with custom micro-moulds. Real-ear measurements verified. Confirmed Revenue: R38,000.00.",
      metadata: { outcome: "hearing_aid_fitted", revenue_zar: 38000 },
      created_at: new Date(now.getTime() - 24 * 3600 * 1000).toISOString(),
    },
    {
      id: "act-demo-04",
      organization_id: orgId,
      contact_id: "cnt-demo-03",
      inquiry_id: "inq-demo-03",
      staff_name: "Reception Desk",
      activity_type: "appointment_completed",
      title: "Clinical Outcome Logged: Wax Cleared",
      description: "Bilateral cerumen impaction removed safely via gentle microsuction. Confirmed Revenue: R650.00.",
      metadata: { outcome: "wax_cleared", revenue_zar: 650 },
      created_at: new Date(now.getTime() - 26 * 3600 * 1000).toISOString(),
    },
  ];

  // Synthetic Appointments & Clinical Outcomes (R38,650 ZAR Confirmed Revenue)
  const appointments: DemoAppointment[] = [
    {
      id: "appt-demo-01",
      organization_id: orgId,
      contact_id: "cnt-demo-02",
      inquiry_id: "inq-demo-02",
      location_id: "loc-blt-01",
      title: "Oticon Intent Binaural Fitting - Deon van der Merwe (Demo)",
      appointment_type: "hearing_aid_fitting",
      start_time: new Date(now.getTime() - 26 * 3600 * 1000).toISOString(),
      end_time: new Date(now.getTime() - 25 * 3600 * 1000).toISOString(),
      status: "attended",
      outcome: "hearing_aid_fitted",
      outcome_notes: "Binaural Oticon Intent 1 fitted with custom micro-moulds. Real-ear measurements verified. Patient reported exceptional clarity in noisy environments.",
      revenue_cents: 3800000, // R38,000.00
      created_at: new Date(now.getTime() - 48 * 3600 * 1000).toISOString(),
      updated_at: new Date(now.getTime() - 24 * 3600 * 1000).toISOString(),
    },
    {
      id: "appt-demo-02",
      organization_id: orgId,
      contact_id: "cnt-demo-03",
      inquiry_id: "inq-demo-03",
      location_id: "loc-dbn-01",
      title: "Microsuction Cerumen Removal - Fatima Patel (Demo)",
      appointment_type: "wax_removal",
      start_time: new Date(now.getTime() - 28 * 3600 * 1000).toISOString(),
      end_time: new Date(now.getTime() - 27.5 * 3600 * 1000).toISOString(),
      status: "attended",
      outcome: "wax_cleared",
      outcome_notes: "Bilateral cerumen impaction removed safely via gentle suction. Normal tympanic membrane visualization restored bilaterally.",
      revenue_cents: 65000, // R650.00
      created_at: new Date(now.getTime() - 72 * 3600 * 1000).toISOString(),
      updated_at: new Date(now.getTime() - 26 * 3600 * 1000).toISOString(),
    },
    {
      id: "appt-demo-03",
      organization_id: orgId,
      contact_id: "cnt-demo-01",
      inquiry_id: "inq-demo-01",
      location_id: "loc-dbn-01",
      title: "Diagnostic Pure-Tone Audiometry - Gugulethu Zuma (Demo)",
      appointment_type: "hearing_assessment",
      start_time: new Date(now.getTime() + 18 * 3600 * 1000).toISOString(),
      end_time: new Date(now.getTime() + 19 * 3600 * 1000).toISOString(),
      status: "scheduled",
      created_at: new Date(now.getTime() - 14 * 3600 * 1000).toISOString(),
      updated_at: new Date(now.getTime() - 14 * 3600 * 1000).toISOString(),
    },
  ];

  // Synthetic Unmatched Calendar Booking for Reconciliation Engine demonstration
  const unmatched_bookings: DemoUnmatchedBooking[] = [
    {
      id: "unmatched-demo-01",
      organization_id: orgId,
      external_calendar_id: "gcal_evt_synthetic_9001",
      external_provider: "google_calendar",
      title: "Direct Google Calendar Booking - Mrs. S. Dlamini",
      attendee_name: "Sindi Dlamini (Demo)",
      attendee_email: "sindi.dlamini@demo.example.co.za",
      attendee_phone: "+27 82 000 0109",
      start_time: new Date(now.getTime() + 24 * 3600 * 1000).toISOString(),
      end_time: new Date(now.getTime() + 25 * 3600 * 1000).toISOString(),
      resolution_status: "pending",
      raw_payload: { provider: "Google Calendar Sync", summary: "Direct booking without matching CRM inquiry" },
      created_at: new Date(now.getTime() - 2 * 3600 * 1000).toISOString(),
      updated_at: new Date(now.getTime() - 2 * 3600 * 1000).toISOString(),
    },
  ];

  // Synthetic Prioritized Daily Action Queue Tasks
  const tasks: DemoTask[] = [
    {
      id: "task-demo-01",
      organization_id: orgId,
      contact_id: "cnt-demo-04",
      inquiry_id: "inq-demo-04",
      contactName: "Brandon Naicker (Demo)",
      contactPhone: "+27 82 000 0104",
      locationId: "loc-blt-01",
      title: "Overdue Callback: Tinnitus Screening Inquiry",
      description: "[OVERDUE SLA] Patient submitted Facebook Lead Ad form for Ballito clinic screening. 2-hour response SLA exceeded.",
      task_type: "follow_up_call",
      priority: "urgent",
      due_at: new Date(now.getTime() - 2 * 3600 * 1000).toISOString(), // 2 hours overdue!
      is_completed: false,
      created_at: new Date(now.getTime() - 6 * 3600 * 1000).toISOString(),
    },
    {
      id: "task-demo-02",
      organization_id: orgId,
      contact_id: "cnt-demo-05",
      inquiry_id: "inq-demo-05",
      contactName: "Sipho Cele (Demo)",
      contactPhone: "+27 82 000 0105",
      locationId: "loc-dbn-01",
      title: "Return Missed Call to Durban Clinic",
      description: "[DUE TODAY] Missed call to Durban Musgrave clinic line (+27 31 201 0001). Priority intake required.",
      task_type: "follow_up_call",
      priority: "high",
      due_at: new Date(now.getTime() + 45 * 60 * 1000).toISOString(), // Due in 45 mins
      is_completed: false,
      created_at: new Date(now.getTime() - 1 * 3600 * 1000).toISOString(),
    },
    {
      id: "task-demo-03",
      organization_id: orgId,
      contact_id: "cnt-demo-02",
      inquiry_id: "inq-demo-02",
      contactName: "Deon van der Merwe (Demo)",
      contactPhone: "+27 82 000 0102",
      locationId: "loc-blt-01",
      title: "14-Day Post-Fitting Hearing Aid Adaptation Review",
      description: "Clinical check-in call following binaural Oticon Intent fitting at Ballito clinic.",
      task_type: "recall",
      priority: "medium",
      due_at: new Date(now.getTime() + 12 * 24 * 3600 * 1000).toISOString(), // Upcoming in 12 days
      is_completed: false,
      created_at: new Date(now.getTime() - 24 * 3600 * 1000).toISOString(),
    },
    {
      id: "task-demo-04",
      organization_id: orgId,
      contact_id: "cnt-demo-03",
      inquiry_id: "inq-demo-03",
      contactName: "Fatima Patel (Demo)",
      contactPhone: "+27 82 000 0103",
      locationId: "loc-dbn-01",
      title: "Send Wax Removal Care Notes via WhatsApp",
      description: "Send post-microsuction ear canal care guidelines to patient.",
      task_type: "send_quote",
      priority: "medium",
      due_at: new Date(now.getTime() - 25 * 3600 * 1000).toISOString(),
      completed_at: new Date(now.getTime() - 25 * 3600 * 1000).toISOString(),
      is_completed: true,
      outcome_notes: "Sent standard clinical post-care brochure.",
      created_at: new Date(now.getTime() - 26 * 3600 * 1000).toISOString(),
    },
  ];

  return {
    contacts,
    inquiries,
    activities,
    appointments,
    unmatched_bookings,
    tasks,
  };
}

/**
 * Thread-safe, persistent demo storage engine.
 * Automatically saves state to local disk in development / server mode,
 * and seamlessly provides cross-request and cross-restart persistence.
 */
export class PersistentDemoStore {
  private static instance: PersistentDemoStore;
  private memoryData: DemoStoreData;
  private filePath: string;
  private isReadOnlyFS = false;

  private constructor() {
    if (typeof window !== "undefined") {
      this.isReadOnlyFS = true;
      this.filePath = "";
      this.memoryData = buildSyntheticDemoSeed();
      return;
    }

    const isTest = process.env.NODE_ENV === "test";
    if (isTest) {
      // In test runner, operate purely in-memory with deterministic seed
      this.isReadOnlyFS = true;
      this.filePath = "";
      this.memoryData = buildSyntheticDemoSeed();
      return;
    }

    // Choose appropriate data directory
    const dataDir = process.env.VERCEL
      ? path.join("/tmp", "kuro-crm-demo")
      : path.join(process.cwd(), ".data");

    this.filePath = path.join(dataDir, "demo-db.json");
    this.memoryData = this.loadFromDisk();
  }

  public static getInstance(): PersistentDemoStore {
    if (!PersistentDemoStore.instance) {
      PersistentDemoStore.instance = new PersistentDemoStore();
    }
    return PersistentDemoStore.instance;
  }

  private loadFromDisk(): DemoStoreData {
    if (typeof window !== "undefined" || !fs?.existsSync) {
      return buildSyntheticDemoSeed();
    }

    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, "utf-8");
        const parsed = JSON.parse(raw);
        if (parsed.contacts && parsed.inquiries && parsed.appointments && parsed.tasks) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn("Could not read persistent demo store from disk, seeding defaults:", err);
    }

    const initial = buildSyntheticDemoSeed();
    this.saveToDisk(initial);
    return initial;
  }

  private saveToDisk(data: DemoStoreData): void {
    if (typeof window !== "undefined" || this.isReadOnlyFS || !fs?.writeFileSync) return;

    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), "utf-8");
    } catch (err) {
      console.warn("Disk write failed in serverless/read-only environment. Operating in-memory:", err);
      this.isReadOnlyFS = true;
    }
  }

  /**
   * Resets the demo store back to pristine synthetic seed data.
   */
  public resetToDefault(): DemoStoreData {
    const seed = buildSyntheticDemoSeed();
    this.memoryData = seed;
    this.saveToDisk(seed);
    return this.memoryData;
  }

  public getData(): DemoStoreData {
    return this.memoryData;
  }

  public mutate(updater: (data: DemoStoreData) => void): DemoStoreData {
    updater(this.memoryData);
    this.saveToDisk(this.memoryData);
    return this.memoryData;
  }
}

export const persistentDemoStore = PersistentDemoStore.getInstance();
