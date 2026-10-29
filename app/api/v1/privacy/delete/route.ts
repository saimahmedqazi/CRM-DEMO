import { NextRequest, NextResponse } from "next/server";
import { leadService } from "@/lib/services/lead-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { contactId, organizationId = "org-hoffman-01", reason } = body;

    if (!contactId) {
      return NextResponse.json(
        { error: "Missing required contactId in deletion request" },
        { status: 400 }
      );
    }

    const success = leadService.anonymizeContact(organizationId, contactId);
    if (!success) {
      return NextResponse.json(
        { error: "Contact not found in organization" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Patient personal information has been irreversibly anonymized in compliance with POPIA Section 24.",
        contactId,
        anonymizedAt: new Date().toISOString(),
        auditReason: reason || "Data Subject Deletion Request",
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("POPIA deletion error:", err);
    return NextResponse.json(
      { error: "Internal server error processing deletion", message: err?.message },
      { status: 500 }
    );
  }
}
