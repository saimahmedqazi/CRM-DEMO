export type TriggerType =
  | "inquiry_created"
  | "status_changed"
  | "follow_up_overdue"
  | "appointment_scheduled"
  | "call_missed";

export interface AutomationCondition {
  field: string;
  operator: "equals" | "not_equals" | "contains" | "in";
  value: any;
}

export interface AutomationAction {
  type: "create_task" | "assign_user" | "update_status" | "add_tag";
  params: Record<string, any>;
}

export interface AutomationRule {
  id: string;
  organization_id: string;
  name: string;
  description: string;
  trigger_type: TriggerType;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  is_active: boolean;
  execution_count: number;
  last_triggered_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AutomationExecutionRecord {
  id: string;
  organization_id: string;
  rule_id: string;
  rule_name: string;
  trigger_event: TriggerType;
  context: Record<string, any>;
  actions_executed: Array<{ type: string; success: boolean; details?: any }>;
  status: "success" | "failed";
  error_message?: string;
  executed_at: string;
}

export interface AutomationTemplate {
  id: string;
  name: string;
  description: string;
  category: "lead_routing" | "follow_up_sla" | "appointment_lifecycle";
  trigger_type: TriggerType;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
}

export const PRACTICE_TEMPLATES: AutomationTemplate[] = [
  {
    id: "tpl-meta-routing",
    name: "Facebook / Instagram Lead Instant Routing",
    description: "Automatically schedules a high-priority 2-hour SLA callback task whenever a new Meta Lead Ad inquiry is captured.",
    category: "lead_routing",
    trigger_type: "inquiry_created",
    conditions: [
      {
        field: "source",
        operator: "equals",
        value: "meta_ads",
      },
    ],
    actions: [
      {
        type: "create_task",
        params: {
          title: "Urgent Meta Ad Lead Contact (2h SLA)",
          taskType: "follow_up_call",
          priority: "urgent",
          dueMinutes: 120,
        },
      },
      {
        type: "add_tag",
        params: {
          tag: "Meta Instant Lead",
        },
      },
    ],
  },
  {
    id: "tpl-whatsapp-triage",
    name: "WhatsApp Inbound Auto-Triage",
    description: "Tags incoming WhatsApp conversations and creates an actionable response task in the Daily Action Queue.",
    category: "lead_routing",
    trigger_type: "inquiry_created",
    conditions: [
      {
        field: "source",
        operator: "equals",
        value: "whatsapp",
      },
    ],
    actions: [
      {
        type: "create_task",
        params: {
          title: "Reply to Patient WhatsApp Inquiry",
          taskType: "follow_up_call",
          priority: "high",
          dueMinutes: 60,
        },
      },
      {
        type: "add_tag",
        params: {
          tag: "WhatsApp Inbound",
        },
      },
    ],
  },
  {
    id: "tpl-missed-call",
    name: "Missed Call Urgent Callback SLA",
    description: "Triggers immediate urgent priority callback task when a patient disconnects before clinic reception answers.",
    category: "follow_up_sla",
    trigger_type: "call_missed",
    conditions: [],
    actions: [
      {
        type: "create_task",
        params: {
          title: "Return Unanswered Patient Call",
          taskType: "follow_up_call",
          priority: "urgent",
          dueMinutes: 30,
        },
      },
    ],
  },
  {
    id: "tpl-post-fitting-recall",
    name: "Post-Fitting 14-Day Check-in",
    description: "Schedules a clinical follow-up task 14 days after hearing aid fitting to ensure patient adaptation and comfort.",
    category: "appointment_lifecycle",
    trigger_type: "status_changed",
    conditions: [
      {
        field: "status",
        operator: "equals",
        value: "completed",
      },
    ],
    actions: [
      {
        type: "create_task",
        params: {
          title: "14-Day Hearing Aid Adaptation Check-in",
          taskType: "recall",
          priority: "medium",
          dueMinutes: 14 * 24 * 60, // 14 days
        },
      },
    ],
  },
];
