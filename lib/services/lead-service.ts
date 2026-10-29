import { normalizePhone, normalizeEmail, normalizeName } from "@/lib/deduplication/normalizer";

export type InquirySource =
  | "phone"
  | "website"
  | "whatsapp"
  | "meta_ads"
  | "email"
  | "walk_in"
  | "referral"
  | "portal"
  | "direct";

export type InquiryStatus =
  | "new"
  | "contacted"
  | "follow_up_needed"
  | "appointment_booked"
  | "completed"
  | "waiting_response"
  | "not_booked"
  | "cancelled"
  | "no_show"
  | "lost";

export type InquiryPriority = "low" | "medium" | "high" | "urgent";

export interface CreateLeadInput {
  organizationId?: string;
  organization_id?: string;
  firstName?: string;
  first_name?: string;
  lastName?: string;
  last_name?: string;
  email?: string | null;
  phone?: string | null;
  locationId?: string | null;
  location_id?: string | null;
  source: InquirySource;
  status?: InquiryStatus;
  notes?: string | null;
  priority?: InquiryPriority;
  tags?: string[];
  customFields?: Record<string, any>;
  assignedUserId?: string | null;
  staffName?: string;
}

export interface ContactRecord {
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
  created_at: string;
  updated_at: string;
}

export interface InquiryRecord {
  id: string;
  organization_id: string;
  contact_id: string;
  location_id: string | null;
  assigned_user_id: string | null;
  source: InquirySource;
  status: InquiryStatus;
  priority: InquiryPriority;
  loss_reason: string | null;
  notes: string | null;
  custom_fields: Record<string, any>;
  tags: string[];
  last_interaction_at: string;
  created_at: string;
  updated_at: string;
}

export interface ActivityRecord {
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

/**
 * In-memory / Mock Service Store for local testing & SSR demo
 */
class LeadRepository {
  private contacts: ContactRecord[] = [];
  private inquiries: InquiryRecord[] = [];
  private activities: ActivityRecord[] = [];

  constructor() {
    this.seedDemoData();
  }

  public findDuplicateContact(
    orgId: string,
    phoneNormalized: string | null,
    email: string | null
  ): ContactRecord | null {
    if (!phoneNormalized && !email) return null;

    return (
      this.contacts.find((c) => {
        if (c.organization_id !== orgId) return false;
        if (phoneNormalized && c.phone_normalized === phoneNormalized) return true;
        if (email && c.email?.toLowerCase() === email.toLowerCase()) return true;
        return false;
      }) || null
    );
  }

  public createLead(input: CreateLeadInput): { contact: ContactRecord; inquiry: InquiryRecord; isExistingContact: boolean } {
    const orgId = (input.organizationId || input.organization_id || "hoffman-audiology");
    const rawFirst = input.firstName || input.first_name || "Unknown";
    const rawLast = input.lastName || input.last_name || "";
    const locId = input.locationId || input.location_id || null;

    const normalizedPhone = normalizePhone(input.phone);
    const normalizedEmail = normalizeEmail(input.email);
    const firstName = normalizeName(rawFirst);
    const lastName = normalizeName(rawLast);

    // Step 1: Deduplication check
    const existingContact = this.findDuplicateContact(orgId, normalizedPhone, normalizedEmail);

    let contact: ContactRecord;
    let isExistingContact = false;

    const now = new Date().toISOString();

    if (existingContact) {
      contact = existingContact;
      isExistingContact = true;
      // Update contact timestamp and merge any new tags
      contact.updated_at = now;
      if (input.tags) {
        contact.tags = Array.from(new Set([...contact.tags, ...input.tags]));
      }
    } else {
      contact = {
        id: `cnt-${Math.random().toString(36).substring(2, 9)}`,
        organization_id: orgId,
        first_name: firstName,
        last_name: lastName,
        email: normalizedEmail,
        phone: input.phone || null,
        phone_normalized: normalizedPhone,
        preferred_location_id: locId,
        custom_fields: input.customFields || {},
        tags: input.tags || [],
        created_at: now,
        updated_at: now,
      };
      this.contacts.push(contact);
    }

    // Step 2: Create Inquiry
    const inquiry: InquiryRecord = {
      id: `inq-${Math.random().toString(36).substring(2, 9)}`,
      organization_id: orgId,
      contact_id: contact.id,
      location_id: locId || contact.preferred_location_id,
      assigned_user_id: input.assignedUserId || null,
      source: input.source,
      status: input.status || "new",
      priority: input.priority || "medium",
      loss_reason: null,
      notes: input.notes || null,
      custom_fields: input.customFields || {},
      tags: input.tags || [],
      last_interaction_at: now,
      created_at: now,
      updated_at: now,
    };
    this.inquiries.push(inquiry);

    // Step 3: Record Activity Log
    this.activities.push({
      id: `act-${Math.random().toString(36).substring(2, 9)}`,
      organization_id: orgId,
      contact_id: contact.id,
      inquiry_id: inquiry.id,
      staff_name: input.staffName || "System / Ingestion",
      activity_type: "inquiry_created",
      title: isExistingContact
        ? `Repeat inquiry received from ${input.source}`
        : `New lead captured from ${input.source}`,
      description: input.notes || `Inquiry created via ${input.source}`,
      metadata: { source: input.source, isExistingContact },
      created_at: now,
    });

    return { contact, inquiry, isExistingContact };
  }

  public findContactsByOrg(orgId: string): ContactRecord[] {
    return this.contacts.filter((c) => c.organization_id === orgId && !(c as any).is_archived);
  }

  public findInquiriesByContact(contactId: string): InquiryRecord[] {
    return this.inquiries
      .filter((i) => i.contact_id === contactId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public recordActivity(activity: {
    organization_id: string;
    contact_id: string;
    inquiry_id?: string;
    activity_type: string;
    title: string;
    content?: string;
    staff_name?: string;
  }): ActivityRecord {
    const act: ActivityRecord = {
      id: `act-${Math.random().toString(36).substring(2, 9)}`,
      organization_id: activity.organization_id,
      contact_id: activity.contact_id,
      inquiry_id: activity.inquiry_id,
      staff_name: activity.staff_name || "System",
      activity_type: activity.activity_type,
      title: activity.title,
      description: activity.content || null,
      metadata: {},
      created_at: new Date().toISOString(),
    };
    this.activities.push(act);
    return act;
  }

  public updateInquiryStage(orgId: string, inquiryId: string, newStage: InquiryStatus, lossReason?: string): boolean {
    return this.updateInquiryStatus(orgId, inquiryId, newStage, lossReason);
  }

  public getInquiries(params: {
    orgId: string;
    search?: string;
    source?: string;
    status?: string;
    locationId?: string;
    page?: number;
    pageSize?: number;
  }) {
    const { orgId, search, source, status, locationId, page = 1, pageSize = 20 } = params;

    let filtered = this.inquiries.filter((inq) => inq.organization_id === orgId);

    if (source && source !== "all") {
      filtered = filtered.filter((i) => i.source === source);
    }

    if (status && status !== "all") {
      filtered = filtered.filter((i) => i.status === status);
    }

    if (locationId && locationId !== "all") {
      filtered = filtered.filter((i) => i.location_id === locationId);
    }

    // Join with contact for search & display
    const enriched = filtered.map((inq) => {
      const contact = this.contacts.find((c) => c.id === inq.contact_id);
      return {
        ...inq,
        contactName: contact ? `${contact.first_name} ${contact.last_name}` : "Unknown Contact",
        contactEmail: contact?.email || null,
        contactPhone: contact?.phone || null,
      };
    });

    let results = enriched;

    if (search && search.trim() !== "") {
      const q = search.toLowerCase();
      results = results.filter(
        (item) =>
          item.contactName.toLowerCase().includes(q) ||
          item.contactEmail?.toLowerCase().includes(q) ||
          item.contactPhone?.includes(q) ||
          item.notes?.toLowerCase().includes(q)
      );
    }

    // Sort by created_at DESC
    results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const totalCount = results.length;
    const startIndex = (page - 1) * pageSize;
    const paginated = results.slice(startIndex, startIndex + pageSize);

    return {
      inquiries: paginated,
      totalCount,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    };
  }

  public getContactWithTimeline(orgId: string, contactId: string) {
    const contact = this.contacts.find((c) => c.id === contactId && c.organization_id === orgId);
    if (!contact) return null;

    const inquiries = this.inquiries.filter((i) => i.contact_id === contactId && i.organization_id === orgId);
    const activities = this.activities
      .filter((a) => a.contact_id === contactId && a.organization_id === orgId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return {
      contact,
      inquiries,
      activities,
    };
  }

  public updateInquiryStatus(orgId: string, inquiryId: string, newStatus: InquiryStatus, lossReason?: string, staffName: string = "Staff"): boolean {
    const inq = this.inquiries.find((i) => i.id === inquiryId && i.organization_id === orgId);
    if (!inq) return false;

    const oldStatus = inq.status;
    inq.status = newStatus;
    if (lossReason) inq.loss_reason = lossReason;
    inq.updated_at = new Date().toISOString();
    inq.last_interaction_at = new Date().toISOString();

    this.activities.push({
      id: `act-${Math.random().toString(36).substring(2, 9)}`,
      organization_id: orgId,
      contact_id: inq.contact_id,
      inquiry_id: inq.id,
      staff_name: staffName,
      activity_type: "status_changed",
      title: `Status updated from ${oldStatus} to ${newStatus}`,
      description: lossReason ? `Reason: ${lossReason}` : null,
      metadata: { oldStatus, newStatus, lossReason },
      created_at: new Date().toISOString(),
    });

    return true;
  }

  public addActivityNote(orgId: string, contactId: string, noteText: string, staffName: string = "Staff"): ActivityRecord {
    const act: ActivityRecord = {
      id: `act-${Math.random().toString(36).substring(2, 9)}`,
      organization_id: orgId,
      contact_id: contactId,
      staff_name: staffName,
      activity_type: "note_added",
      title: "Note added by staff",
      description: noteText,
      metadata: {},
      created_at: new Date().toISOString(),
    };
    this.activities.push(act);
    return act;
  }

  public reparentRecordsOnMerge(orgId: string, primaryContactId: string, secondaryContactId: string, staffName: string = "Staff") {
    // Re-point all inquiries from secondary to primary
    this.inquiries.forEach((inq) => {
      if (inq.organization_id === orgId && inq.contact_id === secondaryContactId) {
        inq.contact_id = primaryContactId;
      }
    });

    // Re-point all activities from secondary to primary
    this.activities.forEach((act) => {
      if (act.organization_id === orgId && act.contact_id === secondaryContactId) {
        act.contact_id = primaryContactId;
      }
    });

    // Add immutable audit activity
    this.activities.push({
      id: `act-${Math.random().toString(36).substring(2, 9)}`,
      organization_id: orgId,
      contact_id: primaryContactId,
      staff_name: staffName,
      activity_type: "lead_merged",
      title: "Duplicate contact merged",
      description: `Merged records from contact ID ${secondaryContactId} into primary contact`,
      metadata: { secondaryContactId, primaryContactId },
      created_at: new Date().toISOString(),
    });

    // Archive secondary contact
    const sec = this.contacts.find((c) => c.id === secondaryContactId && c.organization_id === orgId);
    if (sec) {
      (sec as any).is_archived = true;
    }
  }

  public anonymizeContact(orgId: string, contactId: string): boolean {
    const contact = this.contacts.find((c) => c.id === contactId && c.organization_id === orgId);
    if (!contact) return false;

    // 1. Scrub contact PII
    contact.first_name = "Anonymized";
    contact.last_name = "Patient";
    contact.email = null;
    contact.phone = null;
    contact.phone_normalized = null;
    contact.custom_fields = { popia_anonymized: true, anonymized_at: new Date().toISOString() };
    contact.tags = ["POPIA Anonymized"];
    contact.updated_at = new Date().toISOString();

    // 2. Scrub inquiries notes
    this.inquiries.forEach((inq) => {
      if (inq.organization_id === orgId && inq.contact_id === contactId) {
        inq.notes = "[Anonymized per POPIA Section 24]";
        inq.custom_fields = {};
        inq.tags = ["POPIA Anonymized"];
        inq.updated_at = new Date().toISOString();
      }
    });

    // 3. Scrub activity notes
    this.activities.forEach((act) => {
      if (act.organization_id === orgId && act.contact_id === contactId) {
        act.title = "Activity Anonymized";
        act.description = "[Anonymized per POPIA Section 24]";
        act.metadata = {};
      }
    });

    return true;
  }

  private seedDemoData() {
    const orgId = "hoffman-audiology";
    const demoLeads: CreateLeadInput[] = [
      {
        organizationId: orgId,
        firstName: "Gugulethu",
        lastName: "Zuma",
        phone: "+27 82 455 1029",
        email: "gugu.zuma@example.com",
        locationId: "loc-durban",
        source: "website",
        notes: "Experienced sudden hearing loss in right ear over weekend; requested urgent screening at Durban clinic.",
        priority: "urgent",
        tags: ["Urgent Screening", "Durban"],
      },
      {
        organizationId: orgId,
        firstName: "Deon",
        lastName: "van der Merwe",
        phone: "+27 83 912 3344",
        email: "deon.vdm@example.com",
        locationId: "loc-ballito",
        source: "phone",
        notes: "Inquired about upgrade options for Oticon hearing aids. Ballito patient.",
        priority: "medium",
        tags: ["Hearing Aid Upgrade", "Ballito", "Pensioner"],
      },
      {
        organizationId: orgId,
        firstName: "Fatima",
        lastName: "Patel",
        phone: "+27 72 104 8899",
        email: "fatima.patel@example.com",
        locationId: "loc-durban",
        source: "whatsapp",
        notes: "Inquired via WhatsApp asking for ear wax removal pricing and Saturday availability in Durban.",
        priority: "high",
        tags: ["Ear Wax Removal", "WhatsApp Inbound"],
      },
      {
        organizationId: orgId,
        firstName: "Brandon",
        lastName: "Naicker",
        phone: "+27 84 555 7812",
        email: "brandon.naicker@example.com",
        locationId: "loc-ballito",
        source: "meta_ads",
        notes: "Clicked Facebook Ad: 'Free Tinnitus & Hearing Assessment Ballito'. Stalled inquiry needing follow-up.",
        priority: "medium",
        tags: ["Tinnitus", "Meta Lead Ads"],
      },
    ];

    demoLeads.forEach((l) => this.createLead(l));
  }
}

export const leadService = new LeadRepository();
