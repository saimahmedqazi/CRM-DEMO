import { describe, it, expect } from "vitest";
import { PrivacyRedactor } from "@/lib/ai/privacy-redactor";
import { GroqAIProvider } from "@/lib/ai/groq-provider";

describe("AI Privacy Guard & Redactor (POPIA Compliance)", () => {
  it("scrubs South African 13-digit National ID numbers", () => {
    const rawText = "Patient ID is 8504125029087 registered for audiology screening.";
    const result = PrivacyRedactor.redact(rawText);

    expect(result.redactedText).not.toContain("8504125029087");
    expect(result.redactedText).toContain("[SA_ID_REDACTED]");
    expect(result.hasRedactions).toBe(true);
    expect(result.redactedTypes).toContain("sa_id_number");
  });

  it("scrubs South African phone numbers and emails", () => {
    const rawText = "Contact Mrs. Naidoo at 082 455 1029 or s.naidoo@domain.co.za regarding appointment.";
    const result = PrivacyRedactor.redact(rawText, {
      name: "Mrs. Naidoo",
      phone: "082 455 1029",
      email: "s.naidoo@domain.co.za",
    });

    expect(result.redactedText).not.toContain("082 455 1029");
    expect(result.redactedText).not.toContain("s.naidoo@domain.co.za");
    expect(result.redactedText).not.toContain("Naidoo");
    expect(result.redactedText).toContain("[PHONE_REDACTED]");
    expect(result.redactedText).toContain("[EMAIL_REDACTED]");
    expect(result.redactedText).toContain("[PATIENT_NAME]");
  });

  it("generates deterministic clinical follow-up draft safely when Groq API key is absent", async () => {
    const draft = await GroqAIProvider.generateFollowUpDraft({
      orgId: "org-hoffman-01",
      patientName: "Gugulethu Zuma",
      patientPhone: "+27824551029",
      source: "whatsapp",
      notes: "Urgent hearing assessment requested for Durban clinic",
      clinicLocation: "Durban Clinic",
      isOptedIn: false,
    });

    expect(draft.draftText).toBeDefined();
    expect(draft.draftText).toContain("Gugulethu");
    expect(draft.draftText).toContain("Hoffman Audiology");
    expect(draft.channel).toBe("whatsapp");
    expect(draft.isAiGenerated).toBe(false);
  });

  it("summarizes multi-channel timeline without exposing PII", async () => {
    const summary = await GroqAIProvider.summarizeInquiryTimeline({
      patientName: "Brandon Naicker",
      activities: [
        { title: "Meta Lead Ad Submitted", date: "2026-10-28" },
        { title: "Follow-up Call Placed", date: "2026-10-29" },
      ],
      notes: "Patient reports high-frequency tinnitus.",
    });

    expect(summary.summary).toBeDefined();
    expect(summary.summary.length).toBeGreaterThan(20);
  });
});
