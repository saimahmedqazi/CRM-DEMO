import { describe, it, expect } from "vitest";
import { taskService } from "@/lib/services/task-service";

describe("Daily Action Queue and Task Lifecycle", () => {
  const TEST_ORG = "test-org-tasks";

  it("creates tasks and places overdue tasks in the overdue queue", () => {
    const pastTime = new Date(Date.now() - 3600000).toISOString(); // 1 hour ago

    const overdueTask = taskService.createTask({
      organizationId: TEST_ORG,
      contactId: "cnt-test-1",
      contactName: "Bongani Sithole",
      title: "Call back regarding Durban appointment",
      taskType: "follow_up_call",
      dueAt: pastTime,
    });

    expect(overdueTask).toBeDefined();

    const queue = taskService.getDailyActionQueue(TEST_ORG);
    expect(queue.overdue.some((t) => t.id === overdueTask.id)).toBe(true);
  });

  it("completes tasks with outcome notes and removes them from active queues", () => {
    const futureTime = new Date(Date.now() + 3600000).toISOString();

    const task = taskService.createTask({
      organizationId: TEST_ORG,
      contactId: "cnt-test-2",
      contactName: "Nadia Moodley",
      title: "Confirm hearing aid trial date",
      taskType: "appointment_confirmation",
      dueAt: futureTime,
    });

    const completed = taskService.completeTask(
      TEST_ORG,
      task.id,
      "Patient confirmed for Thursday 10:00 Musgrave",
      "Dr. Kara Hoffman"
    );

    expect(completed).toBe(true);

    const queue = taskService.getDailyActionQueue(TEST_ORG);
    expect(queue.dueToday.some((t) => t.id === task.id)).toBe(false);
    expect(queue.completedToday.some((t) => t.id === task.id)).toBe(true);
  });
});
