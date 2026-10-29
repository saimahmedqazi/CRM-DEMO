"use client";

import { useState, useEffect } from "react";
import { CheckSquare, Plus, AlertTriangle, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActionQueueList } from "@/components/tasks/action-queue-list";
import { CreateTaskModal } from "@/components/tasks/create-task-modal";
import { taskService } from "@/lib/services/task-service";

export default function ActionQueuePage() {
  const [queue, setQueue] = useState(taskService.getDailyActionQueue("hoffman-audiology"));
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const reloadTasks = () => {
    setQueue(taskService.getDailyActionQueue("hoffman-audiology"));
  };

  useEffect(() => {
    reloadTasks();
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <CheckSquare className="h-6 w-6 text-primary" />
            <span>Daily Action Queue</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Prioritized follow-up actions and overdue response queue for Durban & Ballito clinics
          </p>
        </div>

        <Button size="sm" onClick={() => setCreateModalOpen(true)} className="gap-1.5 text-xs font-semibold">
          <Plus className="h-4 w-4" />
          <span>New Follow-up Task</span>
        </Button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-950/60 bg-rose-50/50 dark:bg-rose-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300">
              Overdue SLAs
            </span>
            <AlertTriangle className="h-4 w-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-800 dark:text-rose-200 mt-2 font-mono">
            {queue.overdue.length}
          </div>
          <p className="text-[11px] text-rose-600 mt-1">Requires immediate patient contact</p>
        </div>

        <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-950/60 bg-amber-50/50 dark:bg-amber-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
              Due Today
            </span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-800 dark:text-amber-200 mt-2 font-mono">
            {queue.dueToday.length}
          </div>
          <p className="text-[11px] text-amber-600 mt-1">Scheduled for business hours today</p>
        </div>

        <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-950/60 bg-emerald-50/50 dark:bg-emerald-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
              Completed Today
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-800 dark:text-emerald-200 mt-2 font-mono">
            {queue.completedToday.length}
          </div>
          <p className="text-[11px] text-emerald-600 mt-1">Logged with documented outcome notes</p>
        </div>
      </div>

      {/* Overdue Section */}
      {queue.overdue.length > 0 && (
        <ActionQueueList
          tasks={queue.overdue}
          type="overdue"
          title="Overdue Inquiries & Urgent Calls"
          badgeCount={queue.overdue.length}
          onRefresh={reloadTasks}
        />
      )}

      {/* Due Today Section */}
      <ActionQueueList
        tasks={queue.dueToday}
        type="dueToday"
        title="Due Today (Operating Hours)"
        badgeCount={queue.dueToday.length}
        onRefresh={reloadTasks}
      />

      {/* Completed Today Section */}
      {queue.completedToday.length > 0 && (
        <ActionQueueList
          tasks={queue.completedToday}
          type="completedToday"
          title="Completed Today"
          badgeCount={queue.completedToday.length}
          onRefresh={reloadTasks}
        />
      )}

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onTaskCreated={reloadTasks}
      />
    </div>
  );
}
