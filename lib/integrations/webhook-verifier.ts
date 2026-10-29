import crypto from "crypto";

// In-memory idempotency store for development and server actions
const processedIdempotencyKeys = new Set<string>();

export class WebhookVerifier {
  /**
   * Verifies an HMAC-SHA256 signature using constant-time timingSafeEqual.
   */
  public static verifyHmacSha256(
    rawBody: string,
    signatureHeader: string | null,
    secret: string
  ): boolean {
    if (!signatureHeader || !secret) return false;

    try {
      // Remove 'sha256=' prefix if present (Meta standard)
      const cleanSignature = signatureHeader.startsWith("sha256=")
        ? signatureHeader.substring(7)
        : signatureHeader;

      const expectedHmac = crypto
        .createHmac("sha256", secret)
        .update(rawBody, "utf8")
        .digest("hex");

      const sigBuffer = Buffer.from(cleanSignature, "hex");
      const expectedBuffer = Buffer.from(expectedHmac, "hex");

      if (sigBuffer.length !== expectedBuffer.length) {
        return false;
      }

      return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
    } catch (err) {
      console.error("HMAC verification failed:", err);
      return false;
    }
  }

  /**
   * Prevents replay attacks by checking and recording unique idempotency keys.
   * Returns true if key is new and recorded.
   * Returns false if key was already processed (replay).
   */
  public static checkAndRecordIdempotency(
    orgId: string,
    provider: string,
    idempotencyKey: string
  ): boolean {
    const compositeKey = `${orgId}:${provider}:${idempotencyKey}`;
    if (processedIdempotencyKeys.has(compositeKey)) {
      return false; // Already processed!
    }

    processedIdempotencyKeys.add(compositeKey);
    return true;
  }

  /**
   * Clear idempotency store (useful for tests)
   */
  public static clearIdempotencyStore(): void {
    processedIdempotencyKeys.clear();
  }
}
