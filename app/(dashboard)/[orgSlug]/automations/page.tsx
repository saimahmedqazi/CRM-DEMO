"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  automationEngine,
} from "@/lib/automations/engine";
import {
  AutomationRule,
  AutomationExecutionRecord,
  PRACTICE_TEMPLATES,
  TriggerType,
  AutomationCondition,
  AutomationAction,
} from "@/lib/automations/templates";
import { RuleBuilderModal } from "@/components/automations/rule-builder-modal";
import { ExecutionHistoryTable } from "@/components/automations/execution-history-table";

export default function AutomationsPage() {
  const params = useParams();
  const orgSlug = (params?.orgSlug as string) || "hoffman-audiology";
  const orgId = "org-hoffman-01";

  const [activeTab, setActiveTab] = useState<"workflows" | "templates" | "history">("workflows");
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [executions, setExecutions] = useState<AutomationExecutionRecord[]>([]);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);

  const refreshData = () => {
    const r = automationEngine.listRules(orgId);
    const e = automationEngine.listExecutions(orgId);
    setRules(r);
    setExecutions(e);
  };

  useEffect(() => {
    refreshData();
  }, [orgSlug]);

  const handleToggle = (ruleId: string, current: boolean) => {
    automationEngine.toggleRule(orgId, ruleId, !current);
    refreshData();
  };

  const handleInstallTemplate = (templateId: string) => {
    automationEngine.installTemplate(orgId, templateId);
    refreshData();
    setActiveTab("workflows");
  };

  const handleCreateRule = async (data: {
    name: string;
    description: string;
    trigger_type: TriggerType;
    conditions: AutomationCondition[];
    actions: AutomationAction[];
  }) => {
    automationEngine.createRule(orgId, data);
    refreshData();
  };

  const activeCount = rules.filter((r) => r.is_active).length;
  const totalExecutions = rules.reduce((acc, r) => acc + r.execution_count, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Workflow Automation Engine
          </h1>
          <p className="text-sm text-slate-400">
            Durable triggers, condition trees, and automated follow-up actions preventing inquiries from falling through the cracks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab("templates")}
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition"
          >
            Browse Practice Templates
          </button>
          <button
            onClick={() => setIsBuilderOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition"
          >
            <span>+</span> Create Custom Rule
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Active Workflows
          </div>
          <div className="mt-2 text-2xl font-bold text-white">
            {activeCount} <span className="text-sm font-normal text-slate-500">/ {rules.length} total</span>
          </div>
          <div className="mt-1 text-xs text-indigo-400">Automating lead management</div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total Actions Executed
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-400">
            {totalExecutions}
          </div>
          <div className="mt-1 text-xs text-slate-500">Tasks created & leads routed</div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Engine Reliability
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-400">
            100%
          </div>
          <div className="mt-1 text-xs text-slate-500">Loop guard & idempotency safe</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab("workflows")}
          className={`border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
            activeTab === "workflows"
              ? "border-indigo-500 text-indigo-400"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          Active Workflows ({rules.length})
        </button>

        <button
          onClick={() => setActiveTab("templates")}
          className={`border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
            activeTab === "templates"
              ? "border-indigo-500 text-indigo-400"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          Practice Templates ({PRACTICE_TEMPLATES.length})
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
            activeTab === "history"
              ? "border-indigo-500 text-indigo-400"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          Execution Audit Log ({executions.length})
        </button>
      </div>

      {/* Tab 1: Workflows List */}
      {activeTab === "workflows" && (
        <div className="space-y-4">
          {rules.length === 0 ? (
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-12 text-center text-xs text-slate-400">
              No automation rules configured yet. Click &quot;Create Custom Rule&quot; or install a practice template.
            </div>
          ) : (
            rules.map((rule) => (
              <div
                key={rule.id}
                className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg sm:flex-row sm:items-center sm:justify-between hover:border-slate-700 transition"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                      Trigger: {rule.trigger_type.replace(/_/g, " ")}
                    </span>
                    <span className="text-xs text-slate-500">
                      • {rule.execution_count} runs
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white">{rule.name}</h3>
                  <p className="text-xs text-slate-400">{rule.description}</p>

                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    {rule.conditions.length > 0 ? (
                      rule.conditions.map((c, i) => (
                        <span key={i} className="rounded bg-slate-800 px-2 py-0.5 text-[11px] text-amber-300">
                          If {c.field} {c.operator} &quot;{c.value}&quot;
                        </span>
                      ))
                    ) : (
                      <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px] text-slate-400">
                        Always executes
                      </span>
                    )}

                    <span className="text-slate-500">→</span>

                    {rule.actions.map((a, i) => (
                      <span key={i} className="rounded bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 text-[11px] text-emerald-300">
                        {a.type.replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleToggle(rule.id, rule.is_active)}
                    className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                      rule.is_active
                        ? "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                        : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                    }`}
                  >
                    {rule.is_active ? "Enabled ✓" : "Disabled"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Practice Templates */}
      {activeTab === "templates" && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {PRACTICE_TEMPLATES.map((tpl) => (
            <div
              key={tpl.id}
              className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg"
            >
              <div>
                <span className="rounded bg-indigo-500/10 px-2.5 py-0.5 text-xs font-semibold text-indigo-400 uppercase">
                  {tpl.category.replace(/_/g, " ")}
                </span>
                <h3 className="mt-2 text-base font-bold text-white">{tpl.name}</h3>
                <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                  {tpl.description}
                </p>

                <div className="mt-4 space-y-1.5 text-xs text-slate-300">
                  <div>
                    <strong className="text-indigo-300">Trigger:</strong> {tpl.trigger_type.replace(/_/g, " ")}
                  </div>
                  <div>
                    <strong className="text-emerald-300">Actions:</strong> {tpl.actions.map((a) => a.type).join(", ")}
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-slate-800 pt-4 text-right">
                <button
                  onClick={() => handleInstallTemplate(tpl.id)}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition"
                >
                  Install Template →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Execution History */}
      {activeTab === "history" && (
        <ExecutionHistoryTable executions={executions} />
      )}

      {/* Rule Builder Modal */}
      <RuleBuilderModal
        isOpen={isBuilderOpen}
        onClose={() => setIsBuilderOpen(false)}
        onSubmit={handleCreateRule}
      />
    </div>
  );
}
