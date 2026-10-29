import { NextRequest, NextResponse } from "next/server";
import { appointmentService, type AppointmentStatus, type AppointmentOutcome } from "@/lib/services/appointment-service";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const orgId = url.searchParams.get("orgId") || "org-hoffman-01";
  const locationId = url.searchParams.get("locationId") || undefined;
  const status = (url.searchParams.get("status") as AppointmentStatus) || undefined;

  const [appointments, unmatchedBookings] = await Promise.all([
    appointmentService.listAppointments(orgId, {
      locationId: locationId && locationId !== "all" ? locationId : undefined,
      status,
    }),
    appointmentService.listUnmatchedBookings(orgId),
  ]);

  return NextResponse.json({
    appointments,
    unmatchedBookings,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;
    const orgId = body.orgId || "org-hoffman-01";

    if (action === "create") {
      const appt = await appointmentService.createAppointment({
        ...body,
        organization_id: orgId,
      });
      return NextResponse.json({ success: true, appointment: appt });
    }

    if (action === "record_outcome") {
      const { appointmentId, outcome, outcomeNotes, revenueCents } = body;
      const appt = await appointmentService.recordOutcome(
        orgId,
        appointmentId,
        outcome as AppointmentOutcome,
        outcomeNotes,
        revenueCents || 0
      );
      return NextResponse.json({ success: true, appointment: appt });
    }

    if (action === "resolve_unmatched") {
      const { unmatchedId, resolutionAction, targetContactId } = body;
      const result = await appointmentService.resolveUnmatchedBooking(
        orgId,
        unmatchedId,
        resolutionAction,
        targetContactId
      );
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to process appointment action" }, { status: 500 });
  }
}
