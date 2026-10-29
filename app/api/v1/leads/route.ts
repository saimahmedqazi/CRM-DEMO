import { NextRequest, NextResponse } from "next/server";
import { leadService, type InquiryStatus } from "@/lib/services/lead-service";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const orgId = url.searchParams.get("orgId") || "org-hoffman-01";
  const search = url.searchParams.get("search") || undefined;
  const source = url.searchParams.get("source") || undefined;
  const status = url.searchParams.get("status") || undefined;
  const locationId = url.searchParams.get("locationId") || undefined;
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const pageSize = parseInt(url.searchParams.get("pageSize") || "50", 10);

  const result = leadService.getInquiries({
    orgId,
    search,
    source,
    status,
    locationId,
    page,
    pageSize,
  });

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;
    const orgId = body.orgId || "org-hoffman-01";

    if (action === "update_status") {
      const { inquiryId, newStatus, lossReason, staffName } = body;
      const ok = leadService.updateInquiryStatus(
        orgId,
        inquiryId,
        newStatus as InquiryStatus,
        lossReason,
        staffName || "Dr. Kara Hoffman"
      );
      return NextResponse.json({ success: ok });
    }

    if (action === "create") {
      const result = leadService.createLead({
        ...body,
        organization_id: orgId,
      });
      return NextResponse.json({ success: true, result });
    }

    if (action === "merge") {
      const { primaryContactId, secondaryContactId, staffName } = body;
      leadService.reparentRecordsOnMerge(
        orgId,
        primaryContactId,
        secondaryContactId,
        staffName || "Dr. Kara Hoffman"
      );
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to process lead action" }, { status: 500 });
  }
}
