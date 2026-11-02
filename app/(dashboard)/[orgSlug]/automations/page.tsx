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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Workflow Automation Engine
          </h1>
          <p className="text-sm text-muted-foreground">
            Durable triggers, condition trees, and automated follow-up actions preventing inquiries from falling through the cracks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab("templates")}
            className="rounded-lg border border-input bg-background px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted transition"
          >
            Browse Practice Templates
          </button>
          <button
            onClick={() => setIsBuilderOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition"
          >
            <span>+</span> Create Custom Rule
          </button>
        </div>
      </div>

      {/* Clinical Policy & Safety Disclosure */}
      <div className="rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/70 dark:bg-blue-950/20 p-4 text-xs text-blue-900 dark:text-blue-200">
        <div className="font-semibold text-foreground mb-1 flex items-center gap-1.5">
          <span>Clinical Policy & Follow-up Configuration Notice</span>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          In accordance with medical practice protocols, automation templates currently manage <strong>internal staff tasks</strong>, priority SLAs, and lead routing. Any outbound patient messaging (SMS, WhatsApp) or calendar alteration is configurable per workspace policy and requires clinical staff approval before transmission. No automated messages are dispatched without prior clinic configuration.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Active Workflows
          </div>
          <div className="mt-2 text-2xl font-bold text-foreground">
            {activeCount} <span className="text-sm font-normal text-muted-foreground">/ {rules.length} total</span>
          </div>
          <div className="mt-1 text-xs text-primary font-medium">Automating lead management</div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Total Actions Executed
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {totalExecutions}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">Tasks created & leads routed</div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Engine Reliability
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            100%
          </div>
          <div className="mt-1 text-xs text-muted-foreground">Loop guard & idempotency safe</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab("workflows")}
          className={`border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
            activeTab === "workflows"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Active Workflows ({rules.length})
        </button>

        <button
          onClick={() => setActiveTab("templates")}
          className={`border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
            activeTab === "templates"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Practice Templates ({PRACTICE_TEMPLATES.length})
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
            activeTab === "history"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Execution Audit Log ({executions.length})
        </button>
      </div>

      {/* Tab 1: Workflows List */}
      {activeTab === "workflows" && (
        <div className="space-y-4">
          {rules.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-12 text-center text-xs text-muted-foreground">
              No automation rules configured yet. Click &quot;Create Custom Rule&quot; or install a practice template.
            </div>
          ) : (
            rules.map((rule) => (
              <div
                key={rule.id}
                className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between hover:border-primary/40 transition"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                      Trigger: {rule.trigger_type.replace(/_/g, " ")}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      • {rule.execution_count} runs
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-foreground">{rule.name}</h3>
                  <p className="text-xs text-muted-foreground">{rule.description}</p>

                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    {rule.conditions.length > 0 ? (
                      rule.conditions.map((c, i) => (
                        <span key={i} className="rounded bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 px-2 py-0.5 text-[11px]">
                          If {c.field} {c.operator} &quot;{c.value}&quot;
                        </span>
                      ))
                    ) : (
                      <span className="rounded bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                        Always executes
                      </span>
                    )}

                    <span className="text-muted-foreground">→</span>

                    {rule.actions.map((a, i) => (
                      <span key={i} className="rounded bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">
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
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-200"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
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
              className="flex flex-col justify-between rounded-xl border border-border bg-card p-6 shadow-sm"
            >
              <div>
                <span className="rounded bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary uppercase">
                  {tpl.category.replace(/_/g, " ")}
                </span>
                <h3 className="mt-2 text-base font-bold text-foreground">{tpl.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  {tpl.description}
                </p>

                <div className="mt-4 space-y-1.5 text-xs text-foreground">
                  <div>
                    <strong className="text-primary">Trigger:</strong> {tpl.trigger_type.replace(/_/g, " ")}
                  </div>
                  <div>
                    <strong className="text-emerald-600 dark:text-emerald-400">Actions:</strong> {tpl.actions.map((a) => a.type).join(", ")}
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-border pt-4 text-right">
                <button
                  onClick={() => handleInstallTemplate(tpl.id)}
                  className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition"
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
