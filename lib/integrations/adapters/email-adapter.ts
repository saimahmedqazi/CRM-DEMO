import { leadService } from "@/lib/services/lead-service";

export interface InboundEmailPayload {
  from: string; // e.g. "Dr. Sarah Pillay <sarah.pillay@mediclinic.co.za>"
  to: string; // e.g. "inquiries@hoffmanaudiology.co.za"
  subject: string;
  text?: string;
  html?: string;
  date?: string;
}

export class EmailAdapter {
  public static async processWebhook(
    orgId: string,
    payload: InboundEmailPayload
  ) {
    if (!payload.from) {
      return { success: false, message: "Missing sender in email payload" };
    }

    // Parse email and name e.g. "Dr. Kara Hoffman <kara@example.com>"
    let senderName = "Email Inbound";
    let senderEmail = payload.from;

    const match = payload.from.match(/(.*)<(.*)>/);
    if (match) {
      senderName = match[1].trim();
      senderEmail = match[2].trim();
    }

    const nameParts = senderName.split(" ");
    const firstName = nameParts[0] || "Email";
    const lastName = nameParts.slice(1).join(" ") || "Contact";

    const isReferral =
      payload.subject.toLowerCase().includes("referral") ||
      payload.subject.toLowerCase().includes("patient");

    const result = leadService.createLead({
      organization_id: orgId,
      first_name: firstName,
      last_name: lastName,
      email: senderEmail,
      source: isReferral ? "referral" : "email",
      priority: isReferral ? "high" : "medium",
      notes: `Email Subject: "${payload.subject}".\n\nContent:\n${payload.text || "No plain text body"}`,
      tags: ["Email Inbound", isReferral ? "Doctor Referral" : "Direct Inquiry"],
      customFields: {
        emailSubject: payload.subject,
        recipient: payload.to,
      },
      staffName: "Inbound Email Gateway",
    });

    return {
      success: true,
      contactId: result.contact.id,
      inquiryId: result.inquiry.id,
      isExistingContact: result.isExistingContact,
    };
  }
}
