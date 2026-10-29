import { leadService } from "./lead-service";
import {
  persistentDemoStore,
  type DemoTask,
} from "@/lib/db/persistent-demo-store";

export type TaskType =
  | "initial_response"
  | "follow_up_call"
  | "send_quote"
  | "recall"
  | "appointment_confirmation"
  | "general_reminder";

export interface TaskRecord extends DemoTask {
  task_type: TaskType;
}

function normalizeOrgId(orgId?: string | null): string {
  if (!orgId || orgId === "hoffman-audiology" || orgId === "org-hoffman-01") {
    return "org-hoffman-01";
  }
  return orgId;
}

class TaskRepository {
  public getDailyActionQueue(orgId: string) {
    const targetOrg = normalizeOrgId(orgId);
    const store = persistentDemoStore.getData();
    const orgTasks = (store.tasks as TaskRecord[]).filter(
      (t) => normalizeOrgId(t.organization_id) === targetOrg
    );
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    const overdue: TaskRecord[] = [];
    const dueToday: TaskRecord[] = [];
    const upcoming: TaskRecord[] = [];
    const completedToday: TaskRecord[] = [];

    orgTasks.forEach((task) => {
      if (task.is_completed) {
        if (task.completed_at && task.completed_at.startsWith(todayStr)) {
          completedToday.push(task);
        }
        return;
      }

      const dueDate = new Date(task.due_at);
      const taskDateStr = dueDate.toISOString().split("T")[0];

      if (dueDate < now) {
        overdue.push(task);
      } else if (taskDateStr === todayStr) {
        dueToday.push(task);
      } else {
        upcoming.push(task);
      }
    });

    // Sort overdue by earliest due date
    overdue.sort((a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime());
    // Sort dueToday by priority (urgent -> high -> medium -> low)
    const priorityWeight: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
    dueToday.sort((a, b) => (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0));

    return {
      overdue,
      dueToday,
      upcoming,
      completedToday,
      counts: {
        overdue: overdue.length,
        dueToday: dueToday.length,
        upcoming: upcoming.length,
        completedToday: completedToday.length,
      },
    };
  }

  public createTask(input: {
    organizationId: string;
    contactId: string;
    inquiryId?: string | null;
    assignedUserId?: string | null;
    contactName: string;
    contactPhone?: string | null;
    locationId?: string | null;
    title: string;
    description?: string | null;
    taskType: TaskType;
    priority?: "low" | "medium" | "high" | "urgent";
    dueAt: string;
    staffName?: string;
  }): TaskRecord {
    const orgId = normalizeOrgId(input.organizationId);
    let task: TaskRecord;

    persistentDemoStore.mutate((store) => {
      task = {
        id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        organization_id: orgId,
        contact_id: input.contactId,
        inquiry_id: input.inquiryId || null,
        assigned_user_id: input.assignedUserId || null,
        contactName: input.contactName,
        contactPhone: input.contactPhone || null,
        locationId: input.locationId || null,
        title: input.title,
        description: input.description || null,
        task_type: input.taskType,
        priority: input.priority || "medium",
        due_at: input.dueAt,
        is_completed: false,
        created_at: new Date().toISOString(),
      };
      store.tasks.push(task);
    });

    // Record activity in lead timeline
    leadService.addActivityNote(
      orgId,
      input.contactId,
      `Task Created: ${input.title} (Due: ${new Date(input.dueAt).toLocaleString("en-ZA")})`,
      input.staffName || "System"
    );

    return task!;
  }

  public completeTask(
    orgId: string,
    taskId: string,
    outcomeNotes?: string,
    staffName: string = "Dr. Kara Hoffman"
  ): boolean {
    const targetOrg = normalizeOrgId(orgId);
    let success = false;

    persistentDemoStore.mutate((store) => {
      const task = store.tasks.find(
        (t) => t.id === taskId && normalizeOrgId(t.organization_id) === targetOrg
      );
      if (!task) return;

      task.is_completed = true;
      task.completed_at = new Date().toISOString();
      task.outcome_notes = outcomeNotes || null;

      leadService.addActivityNote(
        targetOrg,
        task.contact_id,
        `Task Completed: ${task.title}${outcomeNotes ? ` - Notes: ${outcomeNotes}` : ""}`,
        staffName
      );

      success = true;
    });

    return success;
  }

  public rescheduleTask(
    orgId: string,
    taskId: string,
    newDueAt: string,
    staffName: string = "Staff"
  ): boolean {
    const targetOrg = normalizeOrgId(orgId);
    let success = false;

    persistentDemoStore.mutate((store) => {
      const task = store.tasks.find(
        (t) => t.id === taskId && normalizeOrgId(t.organization_id) === targetOrg
      );
      if (!task) return;

      task.due_at = newDueAt;

      leadService.addActivityNote(
        targetOrg,
        task.contact_id,
        `Rescheduled Task: ${task.title} to ${new Date(newDueAt).toLocaleString("en-ZA")}`,
        staffName
      );

      success = true;
    });

    return success;
  }
}

export const taskService = new TaskRepository();
