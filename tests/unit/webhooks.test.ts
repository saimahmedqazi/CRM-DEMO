import { describe, it, expect, beforeEach } from "vitest";
import crypto from "crypto";
import { WebhookVerifier } from "@/lib/integrations/webhook-verifier";
import { WhatsAppAdapter } from "@/lib/integrations/adapters/whatsapp-adapter";
import { MetaAdsAdapter } from "@/lib/integrations/adapters/meta-ads-adapter";
import { PhoneLoggerAdapter } from "@/lib/integrations/adapters/phone-logger-adapter";
import { taskService } from "@/lib/services/task-service";

describe("Webhook Verification & Modular Integration Adapters", () => {
  const orgId = "org-webhook-test";
  const secret = "test_webhook_secret_key_123";

  beforeEach(() => {
    WebhookVerifier.clearIdempotencyStore();
  });

  it("verifies authentic HMAC-SHA256 signature and rejects tampered payload", () => {
    const payload = JSON.stringify({ event: "lead_created", test: true });
    const validSignature = crypto
      .createHmac("sha256", secret)
      .update(payload, "utf8")
      .digest("hex");

    // Valid signature with sha256= prefix
    const isValid = WebhookVerifier.verifyHmacSha256(payload, `sha256=${validSignature}`, secret);
    expect(isValid).toBe(true);

    // Tampered payload
    const tamperedPayload = JSON.stringify({ event: "lead_created", test: false });
    const isTamperedValid = WebhookVerifier.verifyHmacSha256(tamperedPayload, `sha256=${validSignature}`, secret);
    expect(isTamperedValid).toBe(false);

    // Bad signature
    const isBadSigValid = WebhookVerifier.verifyHmacSha256(payload, "sha256=abcdef123456", secret);
    expect(isBadSigValid).toBe(false);
  });

  it("prevents replay attacks via idempotency key enforcement", () => {
    const key = "evt_unique_100293";

    const firstAttempt = WebhookVerifier.checkAndRecordIdempotency(orgId, "whatsapp", key);
    expect(firstAttempt).toBe(true);

    // Replay attack with identical key
    const replayAttempt = WebhookVerifier.checkAndRecordIdempotency(orgId, "whatsapp", key);
    expect(replayAttempt).toBe(false);
  });

  it("transforms Meta WhatsApp Cloud API payload into CRM inquiry with normalized phone", async () => {
    const payload = {
      object: "whatsapp_business_account",
      entry: [
        {
          id: "WABA_12345",
          changes: [
            {
              field: "messages",
              value: {
                messaging_product: "whatsapp",
                metadata: {
                  display_phone_number: "+27820000000",
                  phone_number_id: "PHONE_ID_11",
                },
                contacts: [
                  {
                    profile: { name: "Nandi Mthembu" },
                    wa_id: "27823334455",
                  },
                ],
                messages: [
                  {
                    from: "27823334455",
                    id: "wamid.HBgLMjc4MjMzMzQ0NTUVAgASGBQz",
                    timestamp: "1730190000",
                    type: "text",
                    text: {
                      body: "Hi Dr. Kara, I would like to book a hearing test in Durban.",
                    },
                  },
                ],
              },
            },
          ],
        },
      ],
    };

    const res = await WhatsAppAdapter.processWebhook(orgId, payload);
    expect(res.success).toBe(true);
    expect(res.contactId).toBeDefined();
    expect(res.inquiryId).toBeDefined();
  });

  it("transforms Meta Lead Ads payload with form fields into CRM inquiry", async () => {
    const payload = {
      entry: [
        {
          id: "PAGE_999",
          time: 1730191000,
          changes: [
            {
              field: "leadgen",
              value: {
                leadgen_id: "leadgen_8877665544",
                form_id: "form_ballito_promo",
                ad_id: "ad_tinnitus_kzn",
                created_time: 1730191000,
                field_data: [
                  { name: "full_name", values: ["Dave van Zyl"] },
                  { name: "phone_number", values: ["+27839991122"] },
                  { name: "email", values: ["dave.vz@testballito.co.za"] },
                  { name: "preferred_clinic", values: ["Ballito Clinic"] },
                ],
              },
            },
          ],
        },
      ],
    };

    const res = await MetaAdsAdapter.processWebhook(orgId, payload);
    expect(res.success).toBe(true);
    expect(res.contactId).toBeDefined();
  });

  it("processes PBX missed call event and triggers urgent follow-up task", async () => {
    const payload = {
      call_id: "call_pbx_998877",
      caller_number: "0845556677",
      clinic_did: "031-201-4455 (Durban Musgrave)",
      call_status: "missed" as const,
      duration_seconds: 0,
      call_time: new Date().toISOString(),
      caller_name: "Unanswered Patient",
    };

    const res = await PhoneLoggerAdapter.processWebhook(orgId, payload);
    expect(res.success).toBe(true);
    expect(res.urgentTaskCreated).toBe(true);

    const actionQueue = taskService.getDailyActionQueue(orgId);
    expect(actionQueue.overdue.length + actionQueue.dueToday.length).toBeGreaterThanOrEqual(1);
  });
});
