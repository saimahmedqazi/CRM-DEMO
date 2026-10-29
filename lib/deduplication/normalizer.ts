/**
 * Normalizes phone numbers to standard E.164 format.
 * Defaults to South Africa (+27) when local 0-prefixed numbers are provided.
 */
export function normalizePhone(rawPhone?: string | null, defaultCountryCode: string = "27"): string | null {
  if (!rawPhone) return null;

  // Strip all non-digit characters except leading plus
  let cleaned = rawPhone.trim().replace(/[^\d+]/g, "");
  if (!cleaned) return null;

  // If already starts with +, remove + to standardize processing
  let hasPlus = false;
  if (cleaned.startsWith("+")) {
    hasPlus = true;
    cleaned = cleaned.substring(1);
  }

  // Handle local South African format e.g. 0821234567 -> 27821234567
  if (cleaned.startsWith("0") && cleaned.length === 10) {
    cleaned = defaultCountryCode + cleaned.substring(1);
  } else if (!hasPlus && cleaned.startsWith(defaultCountryCode)) {
    // Already has country code without +
  } else if (!hasPlus && cleaned.length === 9) {
    // Missing leading zero or country code e.g. 821234567
    cleaned = defaultCountryCode + cleaned;
  }

  // Basic E.164 length validation (between 10 and 15 digits)
  if (cleaned.length < 9 || cleaned.length > 15) {
    return null;
  }

  return `+${cleaned}`;
}

/**
 * Normalizes emails to clean, trimmed, lowercase string.
 */
export function normalizeEmail(rawEmail?: string | null): string | null {
  if (!rawEmail) return null;
  const cleaned = rawEmail.trim().toLowerCase();
  // Basic email pattern check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned)) {
    return null;
  }
  return cleaned;
}

/**
 * Clean and capitalize human names
 */
export function normalizeName(rawName?: string | null): string {
  if (!rawName) return "";
  return rawName
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
