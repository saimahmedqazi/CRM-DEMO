import { NextRequest, NextResponse } from "next/server";
import { leadService } from "@/lib/services/lead-service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ contactId: string }> }
) {
  const { contactId } = await params;
  const url = new URL(req.url);
  const orgId = url.searchParams.get("orgId") || "org-hoffman-01";

  const data = leadService.getContactWithTimeline(orgId, contactId);
  if (!data) {
    return NextResponse.json({ error: "Contact not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ contactId: string }> }
) {
  try {
    const { contactId } = await params;
    const body = await req.json();
    const orgId = body.orgId || "org-hoffman-01";
    const { action } = body;

    if (action === "add_note") {
      const { noteText, staffName = "Dr. Kara Hoffman" } = body;
      if (!noteText) {
        return NextResponse.json({ error: "Missing noteText" }, { status: 400 });
      }
      const act = leadService.addActivityNote(orgId, contactId, noteText, staffName);
      return NextResponse.json({ success: true, activity: act });
    }

    if (action === "anonymize") {
      const ok = leadService.anonymizeContact(orgId, contactId);
      return NextResponse.json({ success: ok });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to process request" }, { status: 500 });
  }
}
