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
      <div className="rounded-xl border border-border bg-card p-8 text-center text-xs text-muted-foreground shadow-sm">
        No workflow executions recorded yet. Automated rules will log here when triggered.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-foreground">
          <thead className="border-b border-border bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Workflow Rule</th>
              <th className="px-4 py-3">Trigger Event</th>
              <th className="px-4 py-3">Actions Executed</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Executed At</th>
              <th className="px-4 py-3 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {executions.map((exec) => {
              const isExpanded = expandedId === exec.id;
              return (
                <React.Fragment key={exec.id}>
                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-semibold text-foreground">
                      {exec.rule_name}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span className="rounded bg-primary/10 px-2 py-0.5 font-medium text-primary capitalize">
                        {exec.trigger_event.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-foreground">
                      <div className="flex flex-wrap gap-1">
                        {exec.actions_executed.map((act, i) => (
                          <span
                            key={i}
                            className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-mono text-foreground"
                          >
                            ✓ {act.type}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {exec.status === "success" ? (
                        <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 text-xs font-semibold">
                          Success
                        </span>
                      ) : (
                        <span className="rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 px-2.5 py-0.5 text-xs font-semibold">
                          Failed
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(exec.executed_at).toLocaleString("en-ZA", { timeZone: "Africa/Johannesburg" })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : exec.id)}
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        {isExpanded ? "Hide ▲" : "View ▼"}
                      </button>
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr className="bg-muted/20">
                      <td colSpan={6} className="p-4">
                        <div className="space-y-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            Payload Context & Action Results:
                          </span>
                          <pre className="rounded-lg bg-card border border-border p-3 font-mono text-xs text-foreground overflow-x-auto">
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
