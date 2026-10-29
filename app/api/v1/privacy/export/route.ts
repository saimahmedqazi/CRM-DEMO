import { NextRequest, NextResponse } from "next/server";
import { leadService } from "@/lib/services/lead-service";
import { appointmentService } from "@/lib/services/appointment-service";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const orgId = url.searchParams.get("organizationId") || "org-hoffman-01";
    const contactId = url.searchParams.get("contactId");

    if (!contactId) {
      return NextResponse.json(
        { error: "Missing required contactId parameter" },
        { status: 400 }
      );
    }

    const timeline = leadService.getContactWithTimeline(orgId, contactId);
    if (!timeline) {
      return NextResponse.json(
        { error: "Contact record not found in organization" },
        { status: 404 }
      );
    }

    const appointments = await appointmentService.listAppointments(orgId);
    const patientAppointments = appointments.filter((a) => a.contact_id === contactId);

    const dsarExport = {
      exportMetadata: {
        regulation: "POPIA (South Africa Protection of Personal Information Act, Section 23)",
        generatedAt: new Date().toISOString(),
        organizationId: orgId,
        contactId,
      },
      personalInformation: {
        firstName: timeline.contact.first_name,
        lastName: timeline.contact.last_name,
        email: timeline.contact.email,
        phone: timeline.contact.phone,
        preferredLocationId: timeline.contact.preferred_location_id,
        createdAt: timeline.contact.created_at,
        updatedAt: timeline.contact.updated_at,
      },
      inboundInquiries: timeline.inquiries,
      clinicalAppointments: patientAppointments,
      interactionAuditLogs: timeline.activities,
    };

    return NextResponse.json(dsarExport, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="popia_dsar_export_${contactId}.json"`,
      },
    });
  } catch (err: any) {
    console.error("POPIA DSAR export error:", err);
    return NextResponse.json(
      { error: "Internal server error generating DSAR export", message: err?.message },
      { status: 500 }
    );
  }
}
