import { describe, it, expect, beforeEach } from "vitest";
import { leadService } from "@/lib/services/lead-service";

describe("POPIA Compliance & Data Subject Rights (DSAR & Right-to-be-Forgotten)", () => {
  const orgId = "org-privacy-test";
  let testContactId: string;

  beforeEach(() => {
    const lead = leadService.createLead({
      organization_id: orgId,
      first_name: "Precious",
      last_name: "Dlamini",
      email: "precious.d@private.co.za",
      phone: "+27829990011",
      source: "website",
      notes: "Confidential: Patient experiences severe binaural hearing loss and vertigo.",
    });
    testContactId = lead.contact.id;
  });

  it("exports complete data subject record under POPIA Section 23", () => {
    const timeline = leadService.getContactWithTimeline(orgId, testContactId);
    expect(timeline).toBeDefined();
    expect(timeline?.contact.first_name).toBe("Precious");
    expect(timeline?.contact.email).toBe("precious.d@private.co.za");
    expect(timeline?.inquiries.length).toBeGreaterThanOrEqual(1);
    expect(timeline?.activities.length).toBeGreaterThanOrEqual(1);
  });

  it("permanently anonymizes patient PII under POPIA Section 24 (Right-to-be-Forgotten)", () => {
    const success = leadService.anonymizeContact(orgId, testContactId);
    expect(success).toBe(true);

    const timeline = leadService.getContactWithTimeline(orgId, testContactId);
    expect(timeline).toBeDefined();
    expect(timeline?.contact.first_name).toBe("Anonymized");
    expect(timeline?.contact.last_name).toBe("Patient");
    expect(timeline?.contact.email).toBeNull();
    expect(timeline?.contact.phone).toBeNull();
    expect(timeline?.contact.phone_normalized).toBeNull();

    // Notes in inquiries scrubbed
    expect(timeline?.inquiries[0].notes).toBe("[Anonymized per POPIA Section 24]");

    // Activity log scrubbed
    expect(timeline?.activities[0].description).toBe("[Anonymized per POPIA Section 24]");
  });
});
