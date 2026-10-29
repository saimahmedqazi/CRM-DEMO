import { leadService } from "@/lib/services/lead-service";

export interface MetaLeadAdPayload {
  entry?: Array<{
    id: string;
    time: number;
    changes?: Array<{
      value: {
        leadgen_id: string;
        form_id: string;
        ad_id?: string;
        created_time: number;
        // In live Meta API, field_data is fetched via leadgen_id; in webhook simulators or direct payload, it is included directly
        field_data?: Array<{
          name: string;
          values: string[];
        }>;
      };
      field: string;
    }>;
  }>;
}

export class MetaAdsAdapter {
  public static async processWebhook(
    orgId: string,
    payload: MetaLeadAdPayload
  ) {
    const change = payload.entry?.[0]?.changes?.[0]?.value;
    if (!change) {
      return { success: false, message: "Invalid Meta Ads payload" };
    }

    const fieldMap: Record<string, string> = {};
    if (change.field_data) {
      change.field_data.forEach((item) => {
        if (item.values && item.values.length > 0) {
          fieldMap[item.name] = item.values[0];
        }
      });
    }

    const fullName = fieldMap["full_name"] || fieldMap["name"] || "Meta Lead Ad Contact";
    const phone = fieldMap["phone_number"] || fieldMap["phone"] || null;
    const email = fieldMap["email"] || null;
    const clinicPref = fieldMap["preferred_clinic"] || fieldMap["location"] || "Durban";

    const nameParts = fullName.trim().split(" ");
    const firstName = nameParts[0] || "Meta";
    const lastName = nameParts.slice(1).join(" ") || "Lead";

    const locationId = clinicPref.toLowerCase().includes("ballito") ? "loc-blt-01" : "loc-dbn-01";

    const result = leadService.createLead({
      organization_id: orgId,
      first_name: firstName,
      last_name: lastName,
      phone,
      email,
      location_id: locationId,
      source: "meta_ads",
      priority: "high",
      notes: `Meta Lead Ad submission (Form ID: ${change.form_id}, Leadgen ID: ${change.leadgen_id}). Campaign interest recorded.`,
      tags: ["Meta Ads", "Facebook Lead", clinicPref],
      customFields: {
        leadgen_id: change.leadgen_id,
        form_id: change.form_id,
        ad_id: change.ad_id,
      },
      staffName: "Meta Graph Webhook",
    });

    return {
      success: true,
      contactId: result.contact.id,
      inquiryId: result.inquiry.id,
      isExistingContact: result.isExistingContact,
    };
  }
}
