"use client";

import { useState } from "react";
import { Plus, X, Calendar, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { taskService, type TaskType } from "@/lib/services/task-service";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: () => void;
}

export function CreateTaskModal({ isOpen, onClose, onTaskCreated }: CreateTaskModalProps) {
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [title, setTitle] = useState("");
  const [taskType, setTaskType] = useState<TaskType>("follow_up_call");
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");
  const [locationId, setLocationId] = useState("loc-durban");
  const [dueHours, setDueHours] = useState("4");
  const [description, setDescription] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dueAt = new Date(Date.now() + Number(dueHours) * 60 * 60 * 1000).toISOString();

    taskService.createTask({
      organizationId: "hoffman-audiology",
      contactId: "cnt-manual",
      contactName,
      contactPhone,
      locationId,
      title,
      description,
      taskType,
      priority,
      dueAt,
      staffName: "Dr. Kara Hoffman",
    });

    onTaskCreated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Plus className="h-4 w-4 text-primary" />
            <span>Schedule Follow-up Action</span>
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-muted-foreground font-medium mb-1">Patient / Contact Name *</label>
            <input
              type="text"
              required
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="e.g. Sipho Khumalo"
              className="w-full h-9 px-3 rounded-md border border-input bg-background text-foreground"
            />
          </div>

          <div>
            <label className="block text-muted-foreground font-medium mb-1">Phone Number</label>
            <input
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="+27 82 123 4567"
              className="w-full h-9 px-3 rounded-md border border-input bg-background text-foreground font-mono"
            />
          </div>

          <div>
            <label className="block text-muted-foreground font-medium mb-1">Action Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Call to discuss hearing aid trial fitting"
              className="w-full h-9 px-3 rounded-md border border-input bg-background text-foreground"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-muted-foreground font-medium mb-1">Action Type</label>
              <select
                value={taskType}
                onChange={(e) => setTaskType(e.target.value as TaskType)}
                className="w-full h-9 px-2 rounded-md border border-input bg-background text-foreground"
              >
                <option value="follow_up_call">Follow-up Call</option>
                <option value="initial_response">Initial Response</option>
                <option value="send_quote">Send Quote / Pricing</option>
                <option value="appointment_confirmation">Confirm Appointment</option>
                <option value="recall">Annual Recall</option>
              </select>
            </div>
            <div>
              <label className="block text-muted-foreground font-medium mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full h-9 px-2 rounded-md border border-input bg-background text-foreground"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-muted-foreground font-medium mb-1">Clinic</label>
              <select
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                className="w-full h-9 px-2 rounded-md border border-input bg-background text-foreground"
              >
                <option value="loc-durban">Durban (Musgrave)</option>
                <option value="loc-ballito">Ballito (The Well)</option>
              </select>
            </div>
            <div>
              <label className="block text-muted-foreground font-medium mb-1">Due In (Business Hours)</label>
              <select
                value={dueHours}
                onChange={(e) => setDueHours(e.target.value)}
                className="w-full h-9 px-2 rounded-md border border-input bg-background text-foreground"
              >
                <option value="2">2 Hours (Urgent)</option>
                <option value="4">4 Hours (Standard)</option>
                <option value="24">1 Business Day</option>
                <option value="48">2 Business Days</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-muted-foreground font-medium mb-1">Context / Instructions</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Clinical context or instructions for receptionist / audiologist..."
              className="w-full p-2.5 rounded-md border border-input bg-background text-foreground"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button size="sm" type="submit">
              Schedule Action
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
