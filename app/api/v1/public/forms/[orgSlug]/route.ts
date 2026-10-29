import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { leadService } from "@/lib/services/lead-service";

interface RouteProps {
  params: Promise<{
    orgSlug: string;
  }>;
}

// In-memory sliding window rate limiter: IP -> Array of timestamps
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_SUBMISSIONS_PER_WINDOW = 5; // Max 5 submissions per minute per IP

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  const validTimestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (validTimestamps.length >= MAX_SUBMISSIONS_PER_WINDOW) {
    return true;
  }

  validTimestamps.push(now);
  rateLimitMap.set(ip, validTimestamps);
  return false;
}

// Strict public schema: ONLY public patient-facing inquiry fields
const PublicFormSchema = z
  .object({
    firstName: z.string().trim().min(1, "First name is required").max(50),
    lastName: z.string().trim().max(50).optional().default(""),
    phone: z.string().trim().max(30).optional().nullable(),
    email: z.string().trim().email("Invalid email address").max(100).optional().nullable(),
    locationId: z.string().trim().max(50).optional().nullable(),
    serviceNeeded: z.string().trim().max(100).optional().default("Diagnostic Hearing Assessment"),
    message: z.string().trim().max(1000).optional().default(""),
    popiaConsent: z.boolean().refine((val) => val === true, {
      message: "POPIA privacy consent is required to process your booking inquiry.",
    }),
    honeypot: z.string().optional().default(""),
    utmParams: z
      .object({
        source: z.string().max(100).optional(),
        medium: z.string().max(100).optional(),
        campaign: z.string().max(100).optional(),
        content: z.string().max(100).optional(),
      })
      .optional(),
  })
  .refine(
    (data) =>
      (data.phone && data.phone.trim().length > 0) ||
      (data.email && data.email.trim().length > 0),
    {
      message: "Please provide either a phone number or email address so the clinic can contact you.",
      path: ["phone"],
    }
  );

export async function POST(req: NextRequest, { params }: RouteProps) {
  const { orgSlug } = await params;

  // 1. Validate Organization Slug
  if (orgSlug !== "hoffman-audiology" && orgSlug !== "org-hoffman-01") {
    return NextResponse.json(
      { error: "Practice workspace not found or inactive" },
      { status: 404 }
    );
  }

  // 2. Client IP Rate Limiting
  const forwardedFor = req.headers.get("x-forwarded-for");
  const clientIp = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

  if (isRateLimited(clientIp)) {
    return NextResponse.json(
      {
        error: "Too many inquiry submissions. Please wait 60 seconds before trying again, or call clinic reception directly.",
      },
      { status: 429 }
    );
  }

  try {
    const rawBody = await req.json();

    // 3. Honeypot Bot Detection
    // If hidden bot trap input is filled, return silent 200 without creating record
    if (rawBody.honeypot && typeof rawBody.honeypot === "string" && rawBody.honeypot.trim() !== "") {
      return NextResponse.json(
        {
          success: true,
          message: "Thank you. Your inquiry has been received. Our clinical reception will be in touch.",
        },
        { status: 200 }
      );
    }

    // 4. Validate Public Payload (Strictly ignores any internal or privileged fields)
    const parsed = PublicFormSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const orgId = "org-hoffman-01";
    const tags = ["Website Embed Form", data.serviceNeeded, "Public Form Submission"];
    if (data.utmParams?.campaign) {
      tags.push(`Campaign: ${data.utmParams.campaign}`);
    }

    // 5. Ingest Lead through Service
    const result = leadService.createLead({
      organization_id: orgId,
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email || null,
      phone: data.phone || null,
      location_id: data.locationId || "loc-dbn-01",
      source: "website",
      priority: "medium",
      notes: `[Service Requested: ${data.serviceNeeded}] ${data.message ? `Patient Message: ${data.message}` : "No additional notes provided."}`,
      tags,
      customFields: {
        utm: data.utmParams || null,
        serviceNeeded: data.serviceNeeded,
        popiaConsented: true,
        submittedVia: "Public Lead Form Embed",
        submittedAt: new Date().toISOString(),
      },
      staffName: "Website Embed Form",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Thank you. Your inquiry has been received. Our clinical reception will be in touch shortly.",
        isExistingContact: result.isExistingContact,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Public lead form submission error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred while processing your request. Please try again." },
      { status: 500 }
    );
  }
}
