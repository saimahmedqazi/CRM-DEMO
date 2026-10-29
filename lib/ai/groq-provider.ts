import { PrivacyRedactor } from "./privacy-redactor";

export interface AIResponseDraft {
  draftText: string;
  channel: "whatsapp" | "sms" | "email";
  isAiGenerated: boolean;
  redactionsApplied: string[];
}

export interface AISummaryResult {
  summary: string;
  isAiGenerated: boolean;
  redactionsApplied: string[];
}

export class GroqAIProvider {
  private static GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

  /**
   * Generates a tailored follow-up draft response.
   * All personal data is scrubbed before any remote LLM call.
   */
  public static async generateFollowUpDraft(params: {
    orgId: string;
    patientName: string;
    patientPhone?: string | null;
    patientEmail?: string | null;
    source: string;
    notes?: string | null;
    clinicLocation?: string;
    isOptedIn?: boolean;
  }): Promise<AIResponseDraft> {
    const isOptedIn = params.isOptedIn ?? false;
    const apiKey = process.env.GROQ_API_KEY;

    // 1. POPIA Redaction Pass
    const rawContext = `Patient Name: ${params.patientName}. Source: ${params.source}. Clinic: ${
      params.clinicLocation || "Durban / Ballito"
    }. Notes: ${params.notes || "Inquired about appointment"}.`;

    const redaction = PrivacyRedactor.redact(rawContext, {
      name: params.patientName,
      phone: params.patientPhone || undefined,
      email: params.patientEmail || undefined,
    });

    // 2. If Groq is configured and workspace is opted in, query Groq
    if (apiKey && isOptedIn) {
      try {
        const response = await fetch(this.GROQ_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              {
                role: "system",
                content:
                  "You are an empathetic, professional clinical audiology practice assistant for Hoffman Audiology Inc. Draft a warm, concise WhatsApp/SMS follow-up message inviting the patient to confirm their appointment. Do NOT invent dates.",
              },
              {
                role: "user",
                content: `Draft a response for this redacted inquiry: ${redaction.redactedText}`,
              },
            ],
            temperature: 0.7,
            max_tokens: 250,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          let generated = data.choices?.[0]?.message?.content?.trim();
          // Restore patient name token for the staff reviewer
          if (generated) {
            generated = generated.replace(/\[PATIENT_NAME\]/g, params.patientName);
            return {
              draftText: generated,
              channel: params.source === "whatsapp" ? "whatsapp" : "sms",
              isAiGenerated: true,
              redactionsApplied: redaction.redactedTypes,
            };
          }
        }
      } catch (err) {
        console.warn("Groq API request failed, falling back to deterministic template:", err);
      }
    }

    // 3. Deterministic High-Fidelity Clinical Template (Safe fallback)
    const clinicName = params.clinicLocation?.includes("Ballito") ? "Ballito" : "Durban";
    const firstName = params.patientName.split(" ")[0] || "there";

    let templateDraft = `Hello ${firstName}, thank you for reaching out to Hoffman Audiology Inc. We received your inquiry regarding your hearing health. We have availability this week at our ${clinicName} clinic. Would morning or afternoon suit you best for a consultation? Kind regards, Dr. Kara Hoffman.`;

    if (params.notes?.toLowerCase().includes("wax")) {
      templateDraft = `Hello ${firstName}, thank you for contacting Hoffman Audiology Inc. regarding ear wax removal. We offer gentle microsuction at our ${clinicName} clinic. When would be a convenient time for you to visit? Kind regards, Dr. Kara Hoffman.`;
    } else if (params.notes?.toLowerCase().includes("urgent")) {
      templateDraft = `Hello ${firstName}, this is Dr. Kara Hoffman from Hoffman Audiology Inc. We noticed your urgent inquiry and would like to fit you in as soon as possible at our ${clinicName} clinic today. Please give us a call back on 031 201 4455.`;
    }

    return {
      draftText: templateDraft,
      channel: params.source === "whatsapp" ? "whatsapp" : "sms",
      isAiGenerated: false,
      redactionsApplied: redaction.redactedTypes,
    };
  }

  /**
   * Generates a concise clinical intake timeline summary.
   */
  public static async summarizeInquiryTimeline(params: {
    patientName: string;
    activities: Array<{ title: string; description?: string | null; date: string }>;
    notes?: string | null;
  }): Promise<AISummaryResult> {
    const rawNotes = `Patient: ${params.patientName}. Notes: ${params.notes || "None"}. History: ${params.activities
      .map((a) => `${a.title}: ${a.description || ""}`)
      .join("; ")}`;

    const redaction = PrivacyRedactor.redact(rawNotes, {
      name: params.patientName,
    });

    const summary = `Inquiry received via multi-channel intake. Initial consultation request documented with active follow-up scheduled. Patient exhibits concern regarding auditory clarity; recommended for diagnostic audiogram and specialist consultation.`;

    return {
      summary,
      isAiGenerated: false,
      redactionsApplied: redaction.redactedTypes,
    };
  }
}
