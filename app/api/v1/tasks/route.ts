import { NextRequest, NextResponse } from "next/server";
import { taskService, type TaskType } from "@/lib/services/task-service";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const orgId = url.searchParams.get("orgId") || "org-hoffman-01";
  const queue = taskService.getDailyActionQueue(orgId);
  return NextResponse.json(queue);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;
    const orgId = body.orgId || "org-hoffman-01";

    if (action === "create") {
      const task = taskService.createTask({
        ...body,
        organizationId: orgId,
        taskType: body.taskType as TaskType,
      });
      return NextResponse.json({ success: true, task });
    }

    if (action === "complete") {
      const { taskId, outcomeNotes, staffName } = body;
      const ok = taskService.completeTask(
        orgId,
        taskId,
        outcomeNotes,
        staffName || "Dr. Kara Hoffman"
      );
      return NextResponse.json({ success: ok });
    }

    if (action === "reschedule") {
      const { taskId, newDueAt, staffName } = body;
      const ok = taskService.rescheduleTask(
        orgId,
        taskId,
        newDueAt,
        staffName || "Dr. Kara Hoffman"
      );
      return NextResponse.json({ success: ok });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to process task action" }, { status: 500 });
  }
}
