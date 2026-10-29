"use client";

import React, { useState } from "react";
import { TriggerType, AutomationCondition, AutomationAction } from "@/lib/automations/templates";

interface RuleBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    description: string;
    trigger_type: TriggerType;
    conditions: AutomationCondition[];
    actions: AutomationAction[];
  }) => Promise<void>;
}

export function RuleBuilderModal({ isOpen, onClose, onSubmit }: RuleBuilderModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [triggerType, setTriggerType] = useState<TriggerType>("inquiry_created");

  // Single condition state for MVP builder
  const [conditionField, setConditionField] = useState("source");
  const [conditionOperator, setConditionOperator] = useState<"equals" | "contains">("equals");
  const [conditionValue, setConditionValue] = useState("whatsapp");

  // Action state
  const [actionType, setActionType] = useState<"create_task" | "add_tag">("create_task");
  const [taskTitle, setTaskTitle] = useState("Immediate Patient Follow-up");
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "urgent">("high");
  const [dueMinutes, setDueMinutes] = useState("60");
  const [tag, setTag] = useState("Priority Inbound");

  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const conditions: AutomationCondition[] = conditionValue.trim()
        ? [
            {
              field: conditionField,
              operator: conditionOperator,
              value: conditionValue,
            },
          ]
        : [];

      const actions: AutomationAction[] =
        actionType === "create_task"
          ? [
              {
                type: "create_task",
                params: {
                  title: taskTitle,
                  taskType: "follow_up_call",
                  priority,
                  dueMinutes: parseInt(dueMinutes),
                },
              },
            ]
          : [
              {
                type: "add_tag",
                params: { tag },
              },
            ];

      await onSubmit({
        name,
        description,
        trigger_type: triggerType,
        conditions,
        actions,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-lg font-bold text-white">Create Automation Workflow</h2>
            <p className="text-xs text-slate-400">Configure deterministic practice trigger and actions</p>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Workflow Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ballito Web Form Follow-up SLA"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Description (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Automatically creates urgent follow-up task for Ballito inquiries"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Trigger */}
          <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-4">
            <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-300">
              Step 1: When Event Occurs (Trigger)
            </span>
            <div className="mt-2">
              <select
                value={triggerType}
                onChange={(e) => setTriggerType(e.target.value as TriggerType)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="inquiry_created">New Inquiry Captured (Web, WhatsApp, Ads, Phone)</option>
                <option value="call_missed">Missed PBX Phone Call</option>
                <option value="status_changed">Pipeline Stage Updated</option>
                <option value="appointment_scheduled">Appointment Scheduled</option>
              </select>
            </div>
          </div>

          {/* Condition */}
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
            <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
              Step 2: If Conditions Match
            </span>
            <div className="mt-2 grid grid-cols-3 gap-2">
              <select
                value={conditionField}
                onChange={(e) => setConditionField(e.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="source">Source Channel</option>
                <option value="location">Clinic Location</option>
                <option value="status">Status</option>
              </select>

              <select
                value={conditionOperator}
                onChange={(e) => setConditionOperator(e.target.value as any)}
                className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="equals">Equals</option>
                <option value="contains">Contains</option>
              </select>

              <input
                type="text"
                value={conditionValue}
                onChange={(e) => setConditionValue(e.target.value)}
                placeholder="whatsapp / durban / etc."
                className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Action */}
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
            <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
              Step 3: Execute Action
            </span>

            <div className="mt-2 space-y-3">
              <select
                value={actionType}
                onChange={(e) => setActionType(e.target.value as any)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="create_task">Create Follow-up Task in Action Queue</option>
                <option value="add_tag">Add Contact Tag</option>
              </select>

              {actionType === "create_task" ? (
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="text-[11px] text-slate-400">Task Title</label>
                    <input
                      type="text"
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400">Priority</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as any)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs text-white"
                    >
                      <option value="urgent">Urgent (Red)</option>
                      <option value="high">High (Amber)</option>
                      <option value="medium">Medium (Blue)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400">Due In (Minutes)</label>
                    <input
                      type="number"
                      value={dueMinutes}
                      onChange={(e) => setDueMinutes(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-[11px] text-slate-400">Tag to Add</label>
                  <input
                    type="text"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-slate-800 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Save Workflow"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
