export interface PipelineStageConfig {
  id: string;
  name: string;
  order: number;
  is_default: boolean;
  is_terminal: boolean;
  color: string;
}

export interface IndustryTemplate {
  id: string;
  name: string;
  description: string;
  default_stages: PipelineStageConfig[];
  loss_reasons: string[];
  default_tags: string[];
  custom_fields: {
    key: string;
    label: string;
    type: "text" | "number" | "select" | "boolean" | "date";
    options?: string[];
    required?: boolean;
  }[];
}

export const INDUSTRY_TEMPLATES: Record<string, IndustryTemplate> = {
  audiology: {
    id: "audiology",
    name: "Audiology & Hearing Care",
    description: "Designed for independent audiology clinics, hearing aid specialists, and ENT referral practices (e.g., Hoffman Audiology Inc.).",
    default_stages: [
      { id: "new", name: "New Inquiry", order: 1, is_default: true, is_terminal: false, color: "#3b82f6" },
      { id: "contacted", name: "Contacted", order: 2, is_default: false, is_terminal: false, color: "#8b5cf6" },
      { id: "follow_up_needed", name: "Follow-up Needed", order: 3, is_default: false, is_terminal: false, color: "#f59e0b" },
      { id: "appointment_booked", name: "Appointment Booked", order: 4, is_default: false, is_terminal: false, color: "#10b981" },
      { id: "completed", name: "Completed", order: 5, is_default: false, is_terminal: true, color: "#059669" },
    ],
    loss_reasons: [
      "Price objection / Hearing aid cost",
      "Out of catchment area / Distance",
      "Purchased from hospital or competitor",
      "Unresponsive after 3+ attempts",
      "Hearing symptoms temporarily resolved",
      "Medical aid / Insurance declined benefit",
      "Family member decision postponed",
    ],
    default_tags: [
      "Hearing Assessment",
      "Hearing Aid Trial",
      "Tinnitus Consultation",
      "Ear Wax Removal",
      "Pediatric Screening",
      "Pensioner",
      "Medical Aid",
    ],
    custom_fields: [
      {
        key: "preferred_clinic",
        label: "Preferred Clinic",
        type: "select",
        options: ["Durban (Musgrave)", "Ballito (The Well)"],
        required: true,
      },
      {
        key: "current_hearing_aid_user",
        label: "Existing Hearing Aid User",
        type: "boolean",
      },
      {
        key: "primary_concern",
        label: "Primary Concern",
        type: "select",
        options: ["General Hearing Difficulty", "Tinnitus / Ringing", "Blocked Ear", "Upgrade Existing Device", "Pediatric Evaluation"],
      },
      {
        key: "referral_source_detail",
        label: "Referring Doctor or Practice",
        type: "text",
      },
    ],
  },
  dental: {
    id: "dental",
    name: "Dental Clinic",
    description: "For dental surgeries, orthodontists, and cosmetic dental practices.",
    default_stages: [
      { id: "new", name: "New Patient Inquiry", order: 1, is_default: true, is_terminal: false, color: "#3b82f6" },
      { id: "contacted", name: "Contacted", order: 2, is_default: false, is_terminal: false, color: "#8b5cf6" },
      { id: "follow_up", name: "Follow-up Scheduled", order: 3, is_default: false, is_terminal: false, color: "#f59e0b" },
      { id: "booked", name: "Exam Scheduled", order: 4, is_default: false, is_terminal: false, color: "#10b981" },
      { id: "completed", name: "Treatment Completed", order: 5, is_default: false, is_terminal: true, color: "#059669" },
    ],
    loss_reasons: [
      "Cost objection / Uncovered by insurance",
      "Distance / Location",
      "Emergency treated elsewhere",
      "Patient anxiety / Cancelled",
    ],
    default_tags: ["Routine Checkup", "Emergency Pain", "Orthodontics", "Cosmetic Whitening"],
    custom_fields: [
      {
        key: "dental_insurance_provider",
        label: "Dental Insurance Provider",
        type: "text",
      },
    ],
  },
  real_estate: {
    id: "real_estate",
    name: "Real Estate Agency",
    description: "For residential and commercial property brokers and estate agents.",
    default_stages: [
      { id: "inquiry", name: "Property Inquiry", order: 1, is_default: true, is_terminal: false, color: "#3b82f6" },
      { id: "qualified", name: "Buyer Qualified", order: 2, is_default: false, is_terminal: false, color: "#8b5cf6" },
      { id: "viewing_scheduled", name: "Viewing Scheduled", order: 3, is_default: false, is_terminal: false, color: "#10b981" },
      { id: "offer_made", name: "Offer Submitted", order: 4, is_default: false, is_terminal: false, color: "#f59e0b" },
      { id: "closed", name: "Deal Registered", order: 5, is_default: false, is_terminal: true, color: "#059669" },
    ],
    loss_reasons: [
      "Property sold to another buyer",
      "Price beyond budget",
      "Bond / Mortgage finance declined",
      "Client withdrew from market",
    ],
    default_tags: ["First-time Buyer", "Cash Investor", "Luxury Property", "Rental Tenant"],
    custom_fields: [
      {
        key: "max_budget",
        label: "Maximum Budget (ZAR)",
        type: "number",
      },
    ],
  },
  professional_services: {
    id: "professional_services",
    name: "Professional Services & Consulting",
    description: "For accounting firms, legal practices, and business consultancies.",
    default_stages: [
      { id: "inquiry", name: "Inquiry Received", order: 1, is_default: true, is_terminal: false, color: "#3b82f6" },
      { id: "discovery_call", name: "Discovery Call", order: 2, is_default: false, is_terminal: false, color: "#8b5cf6" },
      { id: "proposal_sent", name: "Proposal Sent", order: 3, is_default: false, is_terminal: false, color: "#f59e0b" },
      { id: "negotiation", name: "In Negotiation", order: 4, is_default: false, is_terminal: false, color: "#10b981" },
      { id: "contract_signed", name: "Contract Signed", order: 5, is_default: false, is_terminal: true, color: "#059669" },
    ],
    loss_reasons: [
      "Scope mismatch",
      "Budget constraints",
      "Selected incumbent vendor",
      "Project cancelled internally",
    ],
    default_tags: ["High Value", "Retainer", "Advisory", "Tax & Audit"],
    custom_fields: [
      {
        key: "company_size",
        label: "Client Company Size",
        type: "select",
        options: ["1-10", "11-50", "51-200", "201+"],
      },
    ],
  },
};
