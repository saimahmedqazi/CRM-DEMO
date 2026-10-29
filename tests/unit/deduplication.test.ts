import { describe, it, expect } from "vitest";
import { normalizePhone, normalizeEmail, normalizeName } from "@/lib/deduplication/normalizer";
import { leadService } from "@/lib/services/lead-service";

describe("Phone and Email Normalization", () => {
  it("normalizes South African local 10-digit phone numbers into E.164", () => {
    expect(normalizePhone("0821234567")).toBe("+27821234567");
    expect(normalizePhone("082 123 4567")).toBe("+27821234567");
    expect(normalizePhone("031-201-4589")).toBe("+27312014589");
    expect(normalizePhone("+27 82 123 4567")).toBe("+27821234567");
    expect(normalizePhone("27821234567")).toBe("+27821234567");
  });

  it("handles null and malformed phone numbers safely", () => {
    expect(normalizePhone(null)).toBeNull();
    expect(normalizePhone("")).toBeNull();
    expect(normalizePhone("123")).toBeNull(); // too short
  });

  it("normalizes email addresses to lowercase trimmed strings", () => {
    expect(normalizeEmail(" Dr.Hoffman@Hearing.co.za ")).toBe("dr.hoffman@hearing.co.za");
    expect(normalizeEmail("PATIENT@EXAMPLE.COM")).toBe("patient@example.com");
    expect(normalizeEmail("invalid-email-string")).toBeNull();
    expect(normalizeEmail(null)).toBeNull();
  });

  it("normalizes names with proper title casing", () => {
    expect(normalizeName("kara HOFFMAN")).toBe("Kara Hoffman");
    expect(normalizeName("  gugulethu   zuma  ")).toBe("Gugulethu Zuma");
  });
});

describe("Deduplication and Lead Preservation", () => {
  const TEST_ORG = "test-org-dedup";

  it("appends new inquiry to existing contact when phone matches instead of overwriting", () => {
    // 1st Inquiry from Sipho
    const firstResult = leadService.createLead({
      organizationId: TEST_ORG,
      firstName: "Sipho",
      lastName: "Khumalo",
      phone: "082 555 1234",
      email: "sipho@example.com",
      source: "website",
      notes: "First inquiry: tinnitus check",
    });

    expect(firstResult.isExistingContact).toBe(false);
    const originalContactId = firstResult.contact.id;

    // 2nd Inquiry 2 weeks later via phone call with slightly different spacing
    const secondResult = leadService.createLead({
      organizationId: TEST_ORG,
      firstName: "Sipho",
      lastName: "Khumalo",
      phone: "+27825551234",
      email: "sipho@example.com",
      source: "phone",
      notes: "Second inquiry: ready to book assessment",
    });

    expect(secondResult.isExistingContact).toBe(true);
    expect(secondResult.contact.id).toBe(originalContactId); // Kept existing contact!

    // Verify contact timeline contains both inquiries
    const timeline = leadService.getContactWithTimeline(TEST_ORG, originalContactId);
    expect(timeline?.inquiries).toHaveLength(2);
    expect(timeline?.activities.length).toBeGreaterThanOrEqual(2);
  });
});
