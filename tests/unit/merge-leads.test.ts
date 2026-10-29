import { describe, it, expect } from "vitest";
import { leadService } from "@/lib/services/lead-service";

describe("Lead Merging and History Preservation", () => {
  const TEST_ORG = "test-org-merge";

  it("merges secondary contact into primary contact without losing inquiries or audit activities", () => {
    // Create Lead A (Primary)
    const leadA = leadService.createLead({
      organizationId: TEST_ORG,
      firstName: "Devan",
      lastName: "Naidoo",
      phone: "+27831110001",
      email: "devan@example.com",
      source: "website",
      notes: "Devan website inquiry for Ballito",
      locationId: "loc-ballito",
    });

    // Create Lead B (Secondary duplicate created via phone)
    const leadB = leadService.createLead({
      organizationId: TEST_ORG,
      firstName: "D",
      lastName: "Naidoo",
      phone: "+27831110002",
      email: "devan.work@example.com",
      source: "phone",
      notes: "Devan phone inquiry asking about Oticon aids",
      locationId: "loc-durban",
    });

    expect(leadA.contact.id).not.toBe(leadB.contact.id);

    // Merge Lead B into Lead A
    leadService.reparentRecordsOnMerge(TEST_ORG, leadA.contact.id, leadB.contact.id, "Dr. Kara Hoffman");

    // Fetch primary contact timeline
    const primaryData = leadService.getContactWithTimeline(TEST_ORG, leadA.contact.id);
    expect(primaryData).toBeDefined();

    // Primary now owns inquiries from both contacts
    expect(primaryData?.inquiries.length).toBeGreaterThanOrEqual(2);

    // Primary contains the merge audit log
    const mergeActivity = primaryData?.activities.find((a) => a.activity_type === "lead_merged");
    expect(mergeActivity).toBeDefined();
    expect(mergeActivity?.description).toContain(leadB.contact.id);
  });
});
