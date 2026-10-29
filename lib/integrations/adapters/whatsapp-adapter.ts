import { leadService } from "@/lib/services/lead-service";

export interface WhatsAppMessagePayload {
  object?: string;
  entry?: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: string;
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        contacts?: Array<{
          profile: {
            name: string;
          };
          wa_id: string;
        }>;
        messages?: Array<{
          from: string;
          id: string;
          timestamp: string;
          text?: {
            body: string;
          };
          type: string;
        }>;
      };
      field: string;
    }>;
  }>;
}

export class WhatsAppAdapter {
  public static async processWebhook(
    orgId: string,
    payload: WhatsAppMessagePayload
  ) {
    const change = payload.entry?.[0]?.changes?.[0]?.value;
    if (!change || !change.messages || change.messages.length === 0) {
      return { success: false, message: "No inbound messages in payload" };
    }

    const message = change.messages[0];
    const contactProfile = change.contacts?.[0]?.profile;

    const rawSender = message.from; // e.g. "27824551029"
    const senderPhone = rawSender.startsWith("+") ? rawSender : `+${rawSender}`;
    const senderName = contactProfile?.name || "WhatsApp Inbound Patient";
    const textBody = message.text?.body || "[Media / Audio Message]";

    const nameParts = senderName.trim().split(" ");
    const firstName = nameParts[0] || "WhatsApp";
    const lastName = nameParts.slice(1).join(" ") || "Patient";

    const result = leadService.createLead({
      organization_id: orgId,
      first_name: firstName,
      last_name: lastName,
      phone: senderPhone,
      source: "whatsapp",
      priority: "high",
      notes: `Inbound WhatsApp: "${textBody}"`,
      tags: ["WhatsApp Business", "Messaging"],
      customFields: {
        wa_message_id: message.id,
        wa_timestamp: message.timestamp,
      },
      staffName: "Meta WhatsApp Cloud API",
    });

    return {
      success: true,
      contactId: result.contact.id,
      inquiryId: result.inquiry.id,
      isExistingContact: result.isExistingContact,
    };
  }
}
