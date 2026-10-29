import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { leadService, InquirySource, InquiryPriority } from "@/lib/services/lead-service";

const IngestSchema = z.object({
  organizationId: z.string().optional().default("org-hoffman-01"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional().default(""),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  locationId: z.string().optional().nullable(),
  source: z.enum([
    "phone",
    "website",
    "whatsapp",
    "meta_ads",
    "email",
    "walk_in",
    "referral",
    "portal",
    "direct",
  ]).optional().default("website"),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional().default("medium"),
  notes: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  customFields: z.record(z.any()).optional(),
  utmParams: z.object({
    source: z.string().optional(),
    medium: z.string().optional(),
    campaign: z.string().optional(),
    content: z.string().optional(),
  }).optional(),
});

// Demo API keys valid for Kuro SaaS development & sandbox
const VALID_API_KEYS = new Set([
  "kuro_live_hoffman_secret_key",
  "kuro_demo_test_key_12345",
  "kuro_dev_sandbox_key",
]);

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate API Key
    const apiKey = req.headers.get("x-api-key") || req.headers.get("authorization")?.replace("Bearer ", "");
    if (!apiKey || !VALID_API_KEYS.has(apiKey)) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid or missing x-api-key header" },
        { status: 401 }
      );
    }

    // 2. Parse & Validate Payload
    const body = await req.json();
    const parsed = IngestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid lead payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Attach UTM tags if provided
    const combinedTags = [...(data.tags || [])];
    if (data.utmParams?.campaign) {
      combinedTags.push(`Campaign: ${data.utmParams.campaign}`);
    }

    // 3. Create or Deduplicate Lead
    const result = leadService.createLead({
      organization_id: data.organizationId,
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      phone: data.phone,
      location_id: data.locationId,
      source: data.source as InquirySource,
      priority: data.priority as InquiryPriority,
      notes: data.notes,
      tags: combinedTags,
      customFields: {
        ...(data.customFields || {}),
        utm: data.utmParams || null,
      },
      staffName: "API Ingestion Engine",
    });

    return NextResponse.json(
      {
        success: true,
        message: result.isExistingContact
          ? "Repeat inquiry appended to existing patient record"
          : "New patient lead captured successfully",
        contactId: result.contact.id,
        inquiryId: result.inquiry.id,
        isExistingContact: result.isExistingContact,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Ingest API error:", err);
    return NextResponse.json(
      { error: "Internal server error processing ingestion", message: err?.message },
      { status: 500 }
    );
  }
}
