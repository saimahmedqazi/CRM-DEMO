/**
 * POPIA Privacy Redactor
 * Masks South African ID numbers, phone numbers, email addresses, and patient names
 * before text is processed by server-side AI providers.
 */

export interface RedactionResult {
  redactedText: string;
  hasRedactions: boolean;
  redactedTypes: string[];
}

export class PrivacyRedactor {
  // South African 13-digit National ID pattern (YYMMDDSSSSCAZ)
  private static SA_ID_REGEX = /\b\d{2}[0-1]\d[0-3]\d\d{4}[0-1]\d\d\b/g;

  // Phone numbers (E.164 and local formats with optional spaces/hyphens)
  private static PHONE_REGEX = /(\+?27|0)\s?[6-8]\d\s?\d{3}\s?\d{4}/g;

  // Email pattern
  private static EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

  /**
   * Redacts sensitive personal and health identifiers from text.
   */
  public static redact(
    text: string,
    knownEntities?: {
      name?: string;
      phone?: string;
      email?: string;
      idNumber?: string;
    }
  ): RedactionResult {
    if (!text) {
      return { redactedText: "", hasRedactions: false, redactedTypes: [] };
    }

    let result = text;
    const types: string[] = [];

    // 1. Redact Emails first (prevents name tokens from breaking email format)
    if (this.EMAIL_REGEX.test(result)) {
      result = result.replace(this.EMAIL_REGEX, "[EMAIL_REDACTED]");
      types.push("email_address");
    }
    if (knownEntities?.email) {
      result = result.replaceAll(knownEntities.email, "[EMAIL_REDACTED]");
      types.push("email_address");
    }

    // 2. Redact South African 13-digit ID numbers
    if (this.SA_ID_REGEX.test(result)) {
      result = result.replace(this.SA_ID_REGEX, "[SA_ID_REDACTED]");
      types.push("sa_id_number");
    }
    if (knownEntities?.idNumber) {
      result = result.replaceAll(knownEntities.idNumber, "[SA_ID_REDACTED]");
      types.push("sa_id_number");
    }

    // 3. Redact Phone numbers
    if (this.PHONE_REGEX.test(result)) {
      result = result.replace(this.PHONE_REGEX, "[PHONE_REDACTED]");
      types.push("phone_number");
    }
    if (knownEntities?.phone) {
      result = result.replaceAll(knownEntities.phone, "[PHONE_REDACTED]");
      types.push("phone_number");
    }

    // 4. Redact Patient Names last
    if (knownEntities?.name && knownEntities.name.trim().length > 1) {
      const nameParts = knownEntities.name.trim().split(/\s+/);
      nameParts.forEach((part) => {
        if (part.length > 2) {
          const regex = new RegExp(`\\b${part}\\b`, "gi");
          if (regex.test(result)) {
            result = result.replace(regex, "[PATIENT_NAME]");
            types.push("patient_name");
          }
        }
      });
    }

    const uniqueTypes = Array.from(new Set(types));

    return {
      redactedText: result,
      hasRedactions: uniqueTypes.length > 0,
      redactedTypes: uniqueTypes,
    };
  }
}
