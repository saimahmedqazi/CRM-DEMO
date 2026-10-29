"use client";

import { useState } from "react";
import { CheckCircle2, Clock, Phone, AlertCircle, Calendar, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type TaskRecord, taskService } from "@/lib/services/task-service";

interface ActionQueueListProps {
  tasks: TaskRecord[];
  type: "overdue" | "dueToday" | "upcoming" | "completedToday";
  title: string;
  badgeCount: number;
  onRefresh: () => void;
}

export function ActionQueueList({ tasks, type, title, badgeCount, onRefresh }: ActionQueueListProps) {
  const [completeModalTask, setCompleteModalTask] = useState<TaskRecord | null>(null);
  const [outcomeNotes, setOutcomeNotes] = useState("");

  const handleCompleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!completeModalTask) return;

    taskService.completeTask("hoffman-audiology", completeModalTask.id, outcomeNotes, "Dr. Kara Hoffman");
    setCompleteModalTask(null);
    setOutcomeNotes("");
    onRefresh();
  };

  const handleQuickReschedule = (taskId: string, days: number) => {
    const newDue = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
    taskService.rescheduleTask("hoffman-audiology", taskId, newDue, "Dr. Kara Hoffman");
    onRefresh();
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">Urgent</span>;
      case "high":
        return <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">High Priority</span>;
      default:
        return <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">Standard</span>;
    }
  };

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          {type === "overdue" ? (
            <AlertCircle className="h-4 w-4 text-rose-500" />
          ) : type === "dueToday" ? (
            <Clock className="h-4 w-4 text-amber-500" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          )}
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">{title}</h2>
        </div>
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            type === "overdue"
              ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
              : type === "dueToday"
              ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {badgeCount}
        </span>
      </div>

      {/* Tasks List */}
      {tasks.length === 0 ? (
        <div className="p-4 rounded-xl border border-dashed border-border text-center text-xs text-muted-foreground italic">
          No tasks in this category
        </div>
      ) : (
        <div className="space-y-2.5">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`p-4 rounded-xl border bg-card shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-primary/40 ${
                type === "overdue" ? "border-rose-200 dark:border-rose-950/60" : "border-border"
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-foreground">{task.title}</h3>
                  {getPriorityBadge(task.priority)}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{task.contactName}</span>
                  {task.contactPhone && (
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <Phone className="h-3 w-3 text-primary" />
                      {task.contactPhone}
                    </span>
                  )}
                  <span>•</span>
                  <span>{task.locationId === "loc-ballito" ? "Ballito Clinic" : "Durban Clinic"}</span>
                  <span>•</span>
                  <span className="font-mono text-[11px] text-foreground font-semibold">
                    Due: {new Date(task.due_at).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>

                {task.description && (
                  <p className="text-xs text-muted-foreground bg-muted/20 p-2 rounded mt-1">{task.description}</p>
                )}
              </div>

              {/* Action Buttons */}
              {!task.is_completed && (
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickReschedule(task.id, 1)}
                    className="text-xs h-8"
                  >
                    +1 Day
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setCompleteModalTask(task)}
                    className="text-xs h-8 gap-1.5 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Complete</span>
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Complete Task Outcome Modal */}
      {completeModalTask && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-foreground">Record Action Outcome</h3>
              <Button variant="ghost" size="icon" onClick={() => setCompleteModalTask(null)} className="h-7 w-7">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Completing: <strong className="text-foreground">{completeModalTask.title}</strong>
            </p>
            <form onSubmit={handleCompleteSubmit} className="space-y-3">
              <textarea
                rows={3}
                required
                value={outcomeNotes}
                onChange={(e) => setOutcomeNotes(e.target.value)}
                placeholder="Call result, patient response, quote sent, or next steps agreed upon..."
                className="w-full p-2 rounded-md border border-input bg-background text-xs text-foreground"
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" type="button" onClick={() => setCompleteModalTask(null)}>
                  Cancel
                </Button>
                <Button size="sm" type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Mark Complete & Log
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
