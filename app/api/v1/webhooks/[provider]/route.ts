import { NextRequest, NextResponse } from "next/server";
import { WebhookVerifier } from "@/lib/integrations/webhook-verifier";
import { WhatsAppAdapter } from "@/lib/integrations/adapters/whatsapp-adapter";
import { MetaAdsAdapter } from "@/lib/integrations/adapters/meta-ads-adapter";
import { EmailAdapter } from "@/lib/integrations/adapters/email-adapter";
import { PhoneLoggerAdapter } from "@/lib/integrations/adapters/phone-logger-adapter";

interface RouteProps {
  params: Promise<{
    provider: string;
  }>;
}

// Default verification token for Meta App Review / local webhooks
const DEFAULT_VERIFY_TOKEN = process.env.META_VERIFY_TOKEN || "kuro_meta_verify_token_2026";
const DEFAULT_WEBHOOK_SECRET = process.env.META_WEBHOOK_SECRET || "kuro_webhook_secret_demo";

export async function GET(req: NextRequest, { params }: RouteProps) {
  const { provider } = await params;
  const url = new URL(req.url);

  // Meta Webhook Challenge Handshake (WhatsApp & Facebook Lead Ads)
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === DEFAULT_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Invalid verification token" }, { status: 403 });
}

export async function POST(req: NextRequest, { params }: RouteProps) {
  const { provider } = await params;
  const orgId = "org-hoffman-01";

  try {
    const rawBody = await req.text();
    const signature =
      req.headers.get("x-hub-signature-256") ||
      req.headers.get("x-webhook-signature") ||
      null;

    // 1. Signature Verification (if secret is configured and not in dev-bypass mode)
    const isSandboxBypass = req.headers.get("x-kuro-sandbox") === "true";
    if (!isSandboxBypass && signature) {
      const isValid = WebhookVerifier.verifyHmacSha256(
        rawBody,
        signature,
        DEFAULT_WEBHOOK_SECRET
      );
      if (!isValid) {
        return NextResponse.json(
          { error: "Invalid HMAC signature" },
          { status: 401 }
        );
      }
    }

    // 2. Parse JSON Payload
    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Malformed JSON payload" }, { status: 400 });
    }

    // 3. Idempotency Check
    const idempotencyKey =
      req.headers.get("x-idempotency-key") ||
      payload?.id ||
      payload?.entry?.[0]?.id ||
      payload?.call_id ||
      `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const isNew = WebhookVerifier.checkAndRecordIdempotency(orgId, provider, idempotencyKey);
    if (!isNew) {
      return NextResponse.json(
        { status: "duplicate_ignored", message: "Event already processed idempotently" },
        { status: 200 }
      );
    }

    // 4. Dispatch to Adapter
    let result: any;
    switch (provider) {
      case "whatsapp":
        result = await WhatsAppAdapter.processWebhook(orgId, payload);
        break;
      case "meta_ads":
        result = await MetaAdsAdapter.processWebhook(orgId, payload);
        break;
      case "email":
        result = await EmailAdapter.processWebhook(orgId, payload);
        break;
      case "phone":
        result = await PhoneLoggerAdapter.processWebhook(orgId, payload);
        break;
      default:
        return NextResponse.json(
          { error: `Unsupported webhook provider: ${provider}` },
          { status: 400 }
        );
    }

    return NextResponse.json(
      {
        success: true,
        provider,
        idempotencyKey,
        result,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error(`Webhook processing error for ${provider}:`, err);
    return NextResponse.json(
      { error: "Internal error processing webhook", message: err?.message },
      { status: 500 }
    );
  }
}
