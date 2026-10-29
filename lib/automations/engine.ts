import {
  AutomationRule,
  AutomationExecutionRecord,
  TriggerType,
  AutomationCondition,
  AutomationAction,
  PRACTICE_TEMPLATES,
} from "./templates";
import { taskService, TaskType } from "@/lib/services/task-service";
import { leadService } from "@/lib/services/lead-service";

const INITIAL_RULES: AutomationRule[] = [
  {
    id: "rule-meta-default",
    organization_id: "org-hoffman-01",
    name: "Facebook / Instagram Lead Instant Routing",
    description: "Schedules a high-priority 2-hour SLA callback task whenever a new Meta Lead Ad inquiry is captured.",
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
    is_active: true,
    execution_count: 14,
    last_triggered_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    created_at: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "rule-missed-call-default",
    organization_id: "org-hoffman-01",
    name: "Missed Call Urgent Callback SLA",
    description: "Triggers immediate urgent priority callback task when a patient disconnects before clinic reception answers.",
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
    is_active: true,
    execution_count: 8,
    last_triggered_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    created_at: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
  },
];

const INITIAL_EXECUTIONS: AutomationExecutionRecord[] = [
  {
    id: "exec-1",
    organization_id: "org-hoffman-01",
    rule_id: "rule-meta-default",
    rule_name: "Facebook / Instagram Lead Instant Routing",
    trigger_event: "inquiry_created",
    context: {
      source: "meta_ads",
      patient: "Dave van Zyl",
      clinic: "Ballito Clinic",
    },
    actions_executed: [
      { type: "create_task", success: true, details: { taskTitle: "Urgent Meta Ad Lead Contact" } },
      { type: "add_tag", success: true, details: { tag: "Meta Instant Lead" } },
    ],
    status: "success",
    executed_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
  },
];

class AutomationEngine {
  private rules: AutomationRule[] = [...INITIAL_RULES];
  private executions: AutomationExecutionRecord[] = [...INITIAL_EXECUTIONS];

  public listRules(orgId: string): AutomationRule[] {
    return this.rules
      .filter((r) => r.organization_id === orgId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getRule(orgId: string, ruleId: string): AutomationRule | null {
    return this.rules.find((r) => r.organization_id === orgId && r.id === ruleId) || null;
  }

  public createRule(
    orgId: string,
    data: {
      name: string;
      description?: string;
      trigger_type: TriggerType;
      conditions: AutomationCondition[];
      actions: AutomationAction[];
    }
  ): AutomationRule {
    const rule: AutomationRule = {
      id: `rule-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      organization_id: orgId,
      name: data.name,
      description: data.description || "",
      trigger_type: data.trigger_type,
      conditions: data.conditions,
      actions: data.actions,
      is_active: true,
      execution_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.rules.push(rule);
    return rule;
  }

  public toggleRule(orgId: string, ruleId: string, isActive: boolean): boolean {
    const rule = this.getRule(orgId, ruleId);
    if (!rule) return false;
    rule.is_active = isActive;
    rule.updated_at = new Date().toISOString();
    return true;
  }

  public installTemplate(orgId: string, templateId: string): AutomationRule | null {
    const template = PRACTICE_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return null;

    return this.createRule(orgId, {
      name: template.name,
      description: template.description,
      trigger_type: template.trigger_type,
      conditions: template.conditions,
      actions: template.actions,
    });
  }

  public listExecutions(orgId: string, limit: number = 50): AutomationExecutionRecord[] {
    return this.executions
      .filter((e) => e.organization_id === orgId)
      .sort((a, b) => new Date(b.executed_at).getTime() - new Date(a.executed_at).getTime())
      .slice(0, limit);
  }

  /**
   * Evaluates incoming CRM events against active organization rules.
   * Includes loop guard to prevent cascading triggers from recursing beyond depth 3.
   */
  public async evaluateEvent(
    orgId: string,
    triggerType: TriggerType,
    context: Record<string, any>,
    depth: number = 0
  ): Promise<{ evaluated: number; executed: number; errors: string[] }> {
    if (depth > 3) {
      console.warn("Automation loop guard: maximum execution depth (3) exceeded. Halting cascade.");
      return { evaluated: 0, executed: 0, errors: ["Maximum loop depth exceeded"] };
    }

    const activeRules = this.rules.filter(
      (r) => r.organization_id === orgId && r.is_active && r.trigger_type === triggerType
    );

    let executedCount = 0;
    const errors: string[] = [];

    for (const rule of activeRules) {
      // 1. Evaluate Conditions
      const matchesConditions = this.checkConditions(rule.conditions, context);
      if (!matchesConditions) continue;

      // 2. Execute Actions
      const actionResults: Array<{ type: string; success: boolean; details?: any }> = [];
      let ruleSuccess = true;
      let errorMsg: string | undefined;

      for (const action of rule.actions) {
        try {
          const res = await this.executeAction(orgId, action, context, depth);
          actionResults.push({ type: action.type, success: true, details: res });
        } catch (err: any) {
          ruleSuccess = false;
          errorMsg = err?.message || "Action execution failed";
          actionResults.push({ type: action.type, success: false, details: errorMsg });
          errors.push(`Rule "${rule.name}" failed: ${errorMsg}`);
        }
      }

      // 3. Record Execution Audit Log
      rule.execution_count += 1;
      rule.last_triggered_at = new Date().toISOString();

      this.executions.push({
        id: `exec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        organization_id: orgId,
        rule_id: rule.id,
        rule_name: rule.name,
        trigger_event: triggerType,
        context,
        actions_executed: actionResults,
        status: ruleSuccess ? "success" : "failed",
        error_message: errorMsg,
        executed_at: new Date().toISOString(),
      });

      if (ruleSuccess) executedCount += 1;
    }

    return {
      evaluated: activeRules.length,
      executed: executedCount,
      errors,
    };
  }

  private checkConditions(
    conditions: AutomationCondition[],
    context: Record<string, any>
  ): boolean {
    if (!conditions || conditions.length === 0) return true;

    return conditions.every((cond) => {
      const val = context[cond.field];
      switch (cond.operator) {
        case "equals":
          return String(val) === String(cond.value);
        case "not_equals":
          return String(val) !== String(cond.value);
        case "contains":
          return String(val || "").toLowerCase().includes(String(cond.value).toLowerCase());
        case "in":
          return Array.isArray(cond.value) && cond.value.includes(val);
        default:
          return false;
      }
    });
  }

  private async executeAction(
    orgId: string,
    action: AutomationAction,
    context: Record<string, any>,
    depth: number
  ): Promise<any> {
    switch (action.type) {
      case "create_task": {
        const contactId = context.contact_id || context.contactId;
        const inquiryId = context.inquiry_id || context.inquiryId;
        const contactName = context.patient || context.contactName || "Patient";
        const locationId = context.location_id || context.locationId;

        const dueMinutes = action.params.dueMinutes || 120;
        const dueAt = new Date(Date.now() + dueMinutes * 60 * 1000).toISOString();

        return taskService.createTask({
          organizationId: orgId,
          contactId: contactId || `cnt-auto-${Date.now()}`,
          inquiryId,
          contactName,
          locationId,
          title: action.params.title || "Automated Task",
          taskType: (action.params.taskType as TaskType) || "follow_up_call",
          priority: action.params.priority || "high",
          dueAt,
          staffName: "Kuro Automation Engine",
        });
      }

      case "update_status": {
        const inquiryId = context.inquiry_id || context.inquiryId;
        if (inquiryId && action.params.status) {
          return leadService.updateInquiryStage(
            orgId,
            inquiryId,
            action.params.status,
            action.params.lossReason
          );
        }
        return false;
      }

      case "add_tag": {
        const tag = action.params.tag;
        // Recorded in activity log
        const contactId = context.contact_id || context.contactId;
        if (contactId && tag) {
          leadService.recordActivity({
            organization_id: orgId,
            contact_id: contactId,
            activity_type: "tag_added",
            title: `Tag added: ${tag}`,
            content: `Automated rule added tag "${tag}"`,
          });
        }
        return { tagAdded: tag };
      }

      case "assign_user": {
        return { assignedUser: action.params.userId || "Dr. Kara Hoffman" };
      }

      default:
        throw new Error(`Unsupported action type: ${(action as any).type}`);
    }
  }
}

export const automationEngine = new AutomationEngine();
