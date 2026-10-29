import { leadService } from "@/lib/services/lead-service";
import { taskService } from "@/lib/services/task-service";

export interface PhoneCallEventPayload {
  call_id: string;
  caller_number: string;
  clinic_did: string; // Dialed Direct Inward Dialing number (e.g. Durban vs Ballito line)
  call_status: "missed" | "answered" | "voicemail";
  duration_seconds: number;
  call_time: string;
  recording_url?: string;
  caller_name?: string;
}

export class PhoneLoggerAdapter {
  public static async processWebhook(
    orgId: string,
    payload: PhoneCallEventPayload
  ) {
    if (!payload.caller_number) {
      return { success: false, message: "Missing caller_number" };
    }

    const isBallito = payload.clinic_did?.includes("032") || payload.clinic_did?.includes("ballito");
    const locationId = isBallito ? "loc-blt-01" : "loc-dbn-01";
    const clinicName = isBallito ? "Ballito" : "Durban";

    const isMissed = payload.call_status === "missed" || payload.call_status === "voicemail";

    const result = leadService.createLead({
      organization_id: orgId,
      first_name: payload.caller_name || "Phone",
      last_name: "Caller",
      phone: payload.caller_number,
      location_id: locationId,
      source: "phone",
      priority: isMissed ? "urgent" : "medium",
      notes: `${isMissed ? "🚨 MISSED INBOUND CALL" : "Answered call"} from ${payload.caller_number} to ${clinicName} clinic (${payload.duration_seconds}s).`,
      tags: ["Phone Call", clinicName, isMissed ? "Missed Call" : "Answered"],
      customFields: {
        call_id: payload.call_id,
        clinic_did: payload.clinic_did,
        duration: payload.duration_seconds,
        recording_url: payload.recording_url,
      },
      staffName: "Telecom PBX Trunk Adapter",
    });

    // If call was missed, auto-generate urgent follow-up call task in Action Queue
    if (isMissed) {
      taskService.createTask({
        organizationId: orgId,
        contactId: result.contact.id,
        inquiryId: result.inquiry.id,
        contactName: `${result.contact.first_name} ${result.contact.last_name}`,
        contactPhone: result.contact.phone,
        locationId,
        title: `Return Missed Call from ${payload.caller_number}`,
        description: `Patient called ${clinicName} clinic at ${new Date(payload.call_time).toLocaleTimeString("en-ZA", { timeZone: "Africa/Johannesburg" })} but disconnected. Urgent 2h SLA response required.`,
        taskType: "follow_up_call",
        priority: "urgent",
        dueAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      });
    }

    return {
      success: true,
      contactId: result.contact.id,
      inquiryId: result.inquiry.id,
      isExistingContact: result.isExistingContact,
      urgentTaskCreated: isMissed,
    };
  }
}
