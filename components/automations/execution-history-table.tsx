"use client";

import React, { useState } from "react";
import { AutomationExecutionRecord } from "@/lib/automations/templates";

interface ExecutionHistoryTableProps {
  executions: AutomationExecutionRecord[];
}

export function ExecutionHistoryTable({ executions }: ExecutionHistoryTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (executions.length === 0) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-8 text-center text-xs text-slate-400">
        No workflow executions recorded yet. Automated rules will log here when triggered.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="border-b border-slate-800 bg-slate-800/50 text-xs font-semibold uppercase text-slate-400">
            <tr>
              <th className="px-4 py-3">Workflow Rule</th>
              <th className="px-4 py-3">Trigger Event</th>
              <th className="px-4 py-3">Actions Executed</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Executed At</th>
              <th className="px-4 py-3 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {executions.map((exec) => {
              const isExpanded = expandedId === exec.id;
              return (
                <React.Fragment key={exec.id}>
                  <tr className="hover:bg-slate-800/30">
                    <td className="px-4 py-3 font-semibold text-white">
                      {exec.rule_name}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span className="rounded bg-indigo-500/10 px-2 py-0.5 font-medium text-indigo-400 capitalize">
                        {exec.trigger_event.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-300">
                      <div className="flex flex-wrap gap-1">
                        {exec.actions_executed.map((act, i) => (
                          <span
                            key={i}
                            className="rounded bg-slate-800 px-1.5 py-0.5 text-[11px] font-mono text-slate-300"
                          >
                            ✓ {act.type}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {exec.status === "success" ? (
                        <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                          Success
                        </span>
                      ) : (
                        <span className="rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-400">
                          Failed
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {new Date(exec.executed_at).toLocaleString("en-ZA", { timeZone: "Africa/Johannesburg" })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : exec.id)}
                        className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                      >
                        {isExpanded ? "Hide ▲" : "View ▼"}
                      </button>
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr className="bg-slate-950/80">
                      <td colSpan={6} className="p-4">
                        <div className="space-y-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            Payload Context & Action Results:
                          </span>
                          <pre className="rounded-lg bg-slate-900 p-3 font-mono text-xs text-emerald-400 overflow-x-auto">
                            {JSON.stringify(
                              {
                                context: exec.context,
                                actions: exec.actions_executed,
                                error: exec.error_message || null,
                              },
                              null,
                              2
                            )}
                          </pre>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
