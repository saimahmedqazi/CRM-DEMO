import { normalizePhone, normalizeEmail, normalizeName } from "@/lib/deduplication/normalizer";
import {
  persistentDemoStore,
  type DemoContact,
  type DemoInquiry,
  type DemoActivity,
} from "@/lib/db/persistent-demo-store";

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

export interface ContactRecord extends DemoContact {}
export interface InquiryRecord extends DemoInquiry {
  last_interaction_at?: string;
}
export interface ActivityRecord extends DemoActivity {}

/**
 * Normalizes organization identifiers to ensure consistency between slugs and IDs.
 */
function normalizeOrgId(orgId?: string | null): string {
  if (!orgId || orgId === "hoffman-audiology" || orgId === "org-hoffman-01") {
    return "org-hoffman-01";
  }
  return orgId;
}

class LeadRepository {
  public findDuplicateContact(
    orgId: string,
    phoneNormalized: string | null,
    email: string | null
  ): ContactRecord | null {
    if (!phoneNormalized && !email) return null;
    const targetOrg = normalizeOrgId(orgId);
    const store = persistentDemoStore.getData();

    return (
      store.contacts.find((c) => {
        if (normalizeOrgId(c.organization_id) !== targetOrg) return false;
        if (phoneNormalized && c.phone_normalized === phoneNormalized) return true;
        if (email && c.email?.toLowerCase() === email.toLowerCase()) return true;
        return false;
      }) || null
    );
  }

  public createLead(input: CreateLeadInput): {
    contact: ContactRecord;
    inquiry: InquiryRecord;
    isExistingContact: boolean;
  } {
    const orgId = normalizeOrgId(input.organizationId || input.organization_id);
    const rawFirst = input.firstName || input.first_name || "Unknown";
    const rawLast = input.lastName || input.last_name || "";
    const locId = input.locationId || input.location_id || null;

    const normalizedPhone = normalizePhone(input.phone);
    const normalizedEmail = normalizeEmail(input.email);
    const firstName = normalizeName(rawFirst);
    const lastName = normalizeName(rawLast);

    const now = new Date().toISOString();
    let contact: ContactRecord;
    let isExistingContact = false;
    let inquiry: InquiryRecord;

    persistentDemoStore.mutate((store) => {
      // 1. Deduplication check
      const existingContact = this.findDuplicateContact(orgId, normalizedPhone, normalizedEmail);

      if (existingContact) {
        contact = existingContact;
        isExistingContact = true;
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
          tags: input.tags || ["Synthetic Demo Lead"],
          created_at: now,
          updated_at: now,
        };
        store.contacts.push(contact);
      }

      // 2. Create Inquiry
      inquiry = {
        id: `inq-${Math.random().toString(36).substring(2, 9)}`,
        organization_id: orgId,
        contact_id: contact.id,
        location_id: locId || contact.preferred_location_id,
        assigned_user_id: input.assignedUserId || null,
        source: input.source,
        status: input.status || "new",
        priority: input.priority || "medium",
        loss_reason: null,
        loss_notes: null,
        notes: input.notes || null,
        custom_fields: input.customFields || {},
        tags: input.tags || ["Synthetic Demo Lead"],
        last_interaction_at: now,
        created_at: now,
        updated_at: now,
      };
      store.inquiries.push(inquiry);

      // 3. Record Activity Log
      store.activities.push({
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
    });

    return { contact: contact!, inquiry: inquiry!, isExistingContact };
  }

  public findContactsByOrg(orgId: string): ContactRecord[] {
    const targetOrg = normalizeOrgId(orgId);
    return persistentDemoStore
      .getData()
      .contacts.filter((c) => normalizeOrgId(c.organization_id) === targetOrg && !(c as any).is_archived);
  }

  public findInquiriesByContact(contactId: string): InquiryRecord[] {
    return persistentDemoStore
      .getData()
      .inquiries.filter((i) => i.contact_id === contactId)
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
    const orgId = normalizeOrgId(activity.organization_id);
    let act: ActivityRecord;

    persistentDemoStore.mutate((store) => {
      act = {
        id: `act-${Math.random().toString(36).substring(2, 9)}`,
        organization_id: orgId,
        contact_id: activity.contact_id,
        inquiry_id: activity.inquiry_id,
        staff_name: activity.staff_name || "Staff",
        activity_type: activity.activity_type,
        title: activity.title,
        description: activity.content || null,
        metadata: {},
        created_at: new Date().toISOString(),
      };
      store.activities.push(act);
    });

    return act!;
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
    const targetOrg = normalizeOrgId(params.orgId);
    const { search, source, status, locationId, page = 1, pageSize = 20 } = params;
    const store = persistentDemoStore.getData();

    let filtered = store.inquiries.filter((inq) => normalizeOrgId(inq.organization_id) === targetOrg);

    if (source && source !== "all") {
      filtered = filtered.filter((i) => i.source === source);
    }

    if (status && status !== "all") {
      filtered = filtered.filter((i) => i.status === status);
    }

    if (locationId && locationId !== "all") {
      filtered = filtered.filter((i) => i.location_id === locationId);
    }

    // Join with contact for display & search
    const enriched = filtered.map((inq) => {
      const contact = store.contacts.find((c) => c.id === inq.contact_id);
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
    const targetOrg = normalizeOrgId(orgId);
    const store = persistentDemoStore.getData();

    const contact = store.contacts.find(
      (c) => c.id === contactId && normalizeOrgId(c.organization_id) === targetOrg
    );
    if (!contact) return null;

    const inquiries = store.inquiries.filter(
      (i) => i.contact_id === contactId && normalizeOrgId(i.organization_id) === targetOrg
    );
    const activities = store.activities
      .filter((a) => a.contact_id === contactId && normalizeOrgId(a.organization_id) === targetOrg)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return {
      contact,
      inquiries,
      activities,
    };
  }

  public updateInquiryStatus(
    orgId: string,
    inquiryId: string,
    newStatus: InquiryStatus,
    lossReason?: string,
    staffName: string = "Staff"
  ): boolean {
    const targetOrg = normalizeOrgId(orgId);
    let updated = false;

    persistentDemoStore.mutate((store) => {
      const inq = store.inquiries.find(
        (i) => i.id === inquiryId && normalizeOrgId(i.organization_id) === targetOrg
      );
      if (!inq) return;

      const oldStatus = inq.status;
      inq.status = newStatus;
      if (lossReason) inq.loss_reason = lossReason;
      inq.updated_at = new Date().toISOString();

      store.activities.push({
        id: `act-${Math.random().toString(36).substring(2, 9)}`,
        organization_id: targetOrg,
        contact_id: inq.contact_id,
        inquiry_id: inq.id,
        staff_name: staffName,
        activity_type: "status_changed",
        title: `Status updated from ${oldStatus} to ${newStatus}`,
        description: lossReason ? `Reason: ${lossReason}` : null,
        metadata: { oldStatus, newStatus, lossReason },
        created_at: new Date().toISOString(),
      });

      updated = true;
    });

    return updated;
  }

  public addActivityNote(
    orgId: string,
    contactId: string,
    noteText: string,
    staffName: string = "Staff"
  ): ActivityRecord {
    return this.recordActivity({
      organization_id: orgId,
      contact_id: contactId,
      activity_type: "note_added",
      title: "Note added by staff",
      content: noteText,
      staff_name: staffName,
    });
  }

  public reparentRecordsOnMerge(
    orgId: string,
    primaryContactId: string,
    secondaryContactId: string,
    staffName: string = "Staff"
  ) {
    const targetOrg = normalizeOrgId(orgId);

    persistentDemoStore.mutate((store) => {
      // Re-point inquiries
      store.inquiries.forEach((inq) => {
        if (normalizeOrgId(inq.organization_id) === targetOrg && inq.contact_id === secondaryContactId) {
          inq.contact_id = primaryContactId;
        }
      });

      // Re-point activities
      store.activities.forEach((act) => {
        if (normalizeOrgId(act.organization_id) === targetOrg && act.contact_id === secondaryContactId) {
          act.contact_id = primaryContactId;
        }
      });

      // Add audit activity
      store.activities.push({
        id: `act-${Math.random().toString(36).substring(2, 9)}`,
        organization_id: targetOrg,
        contact_id: primaryContactId,
        staff_name: staffName,
        activity_type: "lead_merged",
        title: "Duplicate contact merged",
        description: `Merged records from contact ID ${secondaryContactId} into primary contact`,
        metadata: { secondaryContactId, primaryContactId },
        created_at: new Date().toISOString(),
      });

      // Archive secondary contact
      const sec = store.contacts.find(
        (c) => c.id === secondaryContactId && normalizeOrgId(c.organization_id) === targetOrg
      );
      if (sec) {
        (sec as any).is_archived = true;
      }
    });
  }

  public anonymizeContact(orgId: string, contactId: string): boolean {
    const targetOrg = normalizeOrgId(orgId);
    let success = false;

    persistentDemoStore.mutate((store) => {
      const contact = store.contacts.find(
        (c) => c.id === contactId && normalizeOrgId(c.organization_id) === targetOrg
      );
      if (!contact) return;

      contact.first_name = "Anonymized";
      contact.last_name = "Patient";
      contact.email = null;
      contact.phone = null;
      contact.phone_normalized = null;
      contact.custom_fields = { popia_anonymized: true, anonymized_at: new Date().toISOString() };
      contact.tags = ["POPIA Anonymized"];
      contact.updated_at = new Date().toISOString();

      store.inquiries.forEach((inq) => {
        if (normalizeOrgId(inq.organization_id) === targetOrg && inq.contact_id === contactId) {
          inq.notes = "[Anonymized per POPIA Section 24]";
          inq.custom_fields = {};
          inq.tags = ["POPIA Anonymized"];
          inq.updated_at = new Date().toISOString();
        }
      });

      store.activities.forEach((act) => {
        if (normalizeOrgId(act.organization_id) === targetOrg && act.contact_id === contactId) {
          act.title = "Activity Anonymized";
          act.description = "[Anonymized per POPIA Section 24]";
          act.metadata = {};
        }
      });

      success = true;
    });

    return success;
  }
}

export const leadService = new LeadRepository();
