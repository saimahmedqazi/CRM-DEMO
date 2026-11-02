import { NextRequest, NextResponse } from "next/server";
import { leadService } from "@/lib/services/lead-service";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const orgId = url.searchParams.get("orgId") || "org-hoffman-01";
  const search = url.searchParams.get("search") || undefined;
  const locationId = url.searchParams.get("locationId") || undefined;
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const pageSize = parseInt(url.searchParams.get("pageSize") || "50", 10);

  const result = leadService.getContacts({
    orgId,
    search,
    locationId,
    page,
    pageSize,
  });

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, contactId, orgId = "org-hoffman-01" } = body;

    if (action === "add_note") {
      const { noteText, staffName = "Dr. Kara Hoffman" } = body;
      if (!contactId || !noteText) {
        return NextResponse.json({ error: "Missing contactId or noteText" }, { status: 400 });
      }
      const act = leadService.addActivityNote(orgId, contactId, noteText, staffName);
      return NextResponse.json({ success: true, activity: act });
    }

    if (action === "anonymize") {
      if (!contactId) {
        return NextResponse.json({ error: "Missing contactId" }, { status: 400 });
      }
      const ok = leadService.anonymizeContact(orgId, contactId);
      return NextResponse.json({ success: ok });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to process contact action" }, { status: 500 });
  }
}
