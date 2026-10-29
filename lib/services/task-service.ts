import { leadService } from "./lead-service";

export type TaskType =
  | "initial_response"
  | "follow_up_call"
  | "send_quote"
  | "recall"
  | "appointment_confirmation"
  | "general_reminder";

export interface TaskRecord {
  id: string;
  organization_id: string;
  contact_id: string;
  inquiry_id?: string | null;
  assigned_user_id?: string | null;
  contactName: string;
  contactPhone?: string | null;
  locationId?: string | null;
  title: string;
  description: string | null;
  task_type: TaskType;
  priority: "low" | "medium" | "high" | "urgent";
  due_at: string;
  completed_at?: string | null;
  is_completed: boolean;
  outcome_notes?: string | null;
  created_at: string;
}

class TaskRepository {
  private tasks: TaskRecord[] = [];

  constructor() {
    this.seedDemoTasks();
  }

  public getDailyActionQueue(orgId: string) {
    const orgTasks = this.tasks.filter((t) => t.organization_id === orgId);
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
    const priorityWeight = { urgent: 4, high: 3, medium: 2, low: 1 };
    dueToday.sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);

    return {
      overdue,
      dueToday,
      upcoming,
      completedToday,
      totalPending: overdue.length + dueToday.length + upcoming.length,
    };
  }

  public createTask(input: {
    organizationId: string;
    contactId: string;
    inquiryId?: string | null;
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
    const now = new Date().toISOString();
    const task: TaskRecord = {
      id: `task-${Math.random().toString(36).substring(2, 9)}`,
      organization_id: input.organizationId,
      contact_id: input.contactId,
      inquiry_id: input.inquiryId || null,
      contactName: input.contactName,
      contactPhone: input.contactPhone || null,
      locationId: input.locationId || null,
      title: input.title,
      description: input.description || null,
      task_type: input.taskType,
      priority: input.priority || "medium",
      due_at: input.dueAt,
      is_completed: false,
      created_at: now,
    };

    this.tasks.push(task);

    // Log activity on contact record
    leadService.addActivityNote(
      input.organizationId,
      input.contactId,
      `Task scheduled: ${task.title} (Due: ${new Date(task.due_at).toLocaleString("en-ZA")})`,
      input.staffName || "Staff"
    );

    return task;
  }

  public completeTask(orgId: string, taskId: string, outcomeNotes?: string, staffName: string = "Staff"): boolean {
    const task = this.tasks.find((t) => t.id === taskId && t.organization_id === orgId);
    if (!task) return false;

    task.is_completed = true;
    task.completed_at = new Date().toISOString();
    task.outcome_notes = outcomeNotes || null;

    // Log completion on contact timeline
    leadService.addActivityNote(
      orgId,
      task.contact_id,
      `Completed Task: ${task.title}${outcomeNotes ? ` — Outcome: ${outcomeNotes}` : ""}`,
      staffName
    );

    return true;
  }

  public rescheduleTask(orgId: string, taskId: string, newDueAt: string, staffName: string = "Staff"): boolean {
    const task = this.tasks.find((t) => t.id === taskId && t.organization_id === orgId);
    if (!task) return false;

    task.due_at = newDueAt;

    leadService.addActivityNote(
      orgId,
      task.contact_id,
      `Rescheduled Task: ${task.title} to ${new Date(newDueAt).toLocaleString("en-ZA")}`,
      staffName
    );

    return true;
  }

  private seedDemoTasks() {
    const orgId = "hoffman-audiology";
    const now = new Date();

    // 1 Overdue task: Brandon Naicker Meta Ads lead
    const overdueTime = new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(); // 4 hours ago
    this.tasks.push({
      id: "task-demo-1",
      organization_id: orgId,
      contact_id: "cnt-brandon",
      contactName: "Brandon Naicker",
      contactPhone: "+27 84 555 7812",
      locationId: "loc-ballito",
      title: "Follow up on Facebook Tinnitus Inquiry",
      description: "Brandon filled Meta Lead Ad form for Ballito clinic. Needs initial callback regarding hearing screening.",
      task_type: "initial_response",
      priority: "high",
      due_at: overdueTime,
      is_completed: false,
      created_at: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
    });

    // 1 Due Today: Gugulethu Zuma
    const dueTodayTime = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(); // In 2 hours
    this.tasks.push({
      id: "task-demo-2",
      organization_id: orgId,
      contact_id: "cnt-gugu",
      contactName: "Gugulethu Zuma",
      contactPhone: "+27 82 455 1029",
      locationId: "loc-durban",
      title: "Confirm Urgent Hearing Screening Appointment",
      description: "Call Gugulethu to confirm assessment time slot at Durban Musgrave clinic.",
      task_type: "appointment_confirmation",
      priority: "urgent",
      due_at: dueTodayTime,
      is_completed: false,
      created_at: new Date().toISOString(),
    });

    // 1 Due Today: Fatima Patel
    const dueFatimaTime = new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString();
    this.tasks.push({
      id: "task-demo-3",
      organization_id: orgId,
      contact_id: "cnt-fatima",
      contactName: "Fatima Patel",
      contactPhone: "+27 72 104 8899",
      locationId: "loc-durban",
      title: "Send Wax Removal Pricing & Saturday Availability",
      description: "Patient messaged via WhatsApp asking for Saturday morning Musgrave options.",
      task_type: "send_quote",
      priority: "medium",
      due_at: dueFatimaTime,
      is_completed: false,
      created_at: new Date().toISOString(),
    });
  }
}

export const taskService = new TaskRepository();
