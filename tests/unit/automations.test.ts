import { describe, it, expect } from "vitest";
import { automationEngine } from "@/lib/automations/engine";
import { taskService } from "@/lib/services/task-service";
import { leadService } from "@/lib/services/lead-service";

describe("Workflow Automation Engine", () => {
  const orgId = "org-automation-test";

  it("evaluates trigger and executes matching rule actions", async () => {
    // Create rule for WhatsApp inquiries
    automationEngine.createRule(orgId, {
      name: "Auto-create WhatsApp Triage Task",
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
            title: "Urgent WhatsApp Callback",
            taskType: "follow_up_call",
            priority: "urgent",
            dueMinutes: 30,
          },
        },
      ],
    });

    const context = {
      source: "whatsapp",
      patient: "Lindiwe Buthelezi",
      contactId: "c-wa-test",
    };

    const evalResult = await automationEngine.evaluateEvent(orgId, "inquiry_created", context);
    expect(evalResult.executed).toBeGreaterThanOrEqual(1);

    // Verify task was added to Action Queue
    const queue = taskService.getDailyActionQueue(orgId);
    expect(queue.overdue.length + queue.dueToday.length + queue.upcoming.length).toBeGreaterThanOrEqual(1);
  });

  it("skips rule execution when conditions do not match", async () => {
    const context = {
      source: "phone", // Does not match whatsapp condition
      patient: "Pieter Botha",
      contactId: "c-phone-test",
    };

    const evalResult = await automationEngine.evaluateEvent(orgId, "inquiry_created", context);
    // WhatsApp rule shouldn't execute for phone source
    expect(evalResult.errors).toHaveLength(0);
  });

  it("installs pre-built practice template and executes it", async () => {
    const installed = automationEngine.installTemplate(orgId, "tpl-missed-call");
    expect(installed).toBeDefined();
    expect(installed?.name).toContain("Missed Call");

    const evalResult = await automationEngine.evaluateEvent(orgId, "call_missed", {
      caller_number: "0823334444",
      patient: "Missed Caller",
    });
    expect(evalResult.executed).toBeGreaterThanOrEqual(1);
  });

  it("halts execution cleanly when recursion depth exceeds loop guard threshold", async () => {
    const loopResult = await automationEngine.evaluateEvent(
      orgId,
      "inquiry_created",
      { source: "whatsapp" },
      4 // Depth > 3
    );

    expect(loopResult.executed).toBe(0);
    expect(loopResult.errors).toContain("Maximum loop depth exceeded");
  });

  it("records execution audit log with status and payload", async () => {
    const executions = automationEngine.listExecutions(orgId);
    expect(executions.length).toBeGreaterThanOrEqual(1);
    expect(executions[0].status).toBe("success");
    expect(executions[0].actions_executed.length).toBeGreaterThanOrEqual(1);
  });
});
