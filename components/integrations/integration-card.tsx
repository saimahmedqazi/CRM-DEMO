"use client";

import React, { useState } from "react";

export interface IntegrationInfo {
  id: string;
  name: string;
  provider: "whatsapp" | "meta_ads" | "email" | "phone" | "website" | "calendar";
  description: string;
  status: "active" | "sandbox_ready" | "disabled";
  capabilities: string[];
  webhookPath: string;
}

interface IntegrationCardProps {
  integration: IntegrationInfo;
  onOpenSimulator: (provider: string) => void;
}

export function IntegrationCard({ integration, onOpenSimulator }: IntegrationCardProps) {
  const [copied, setCopied] = useState(false);

  const fullWebhookUrl = typeof window !== "undefined"
    ? `${window.location.origin}${integration.webhookPath}`
    : integration.webhookPath;

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(fullWebhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = () => {
    switch (integration.status) {
      case "active":
        return (
          <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
            Functional (Local / Preview)
          </span>
        );
      case "sandbox_ready":
        return (
          <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-400 border border-amber-500/20">
            Simulated (Sandbox Demo)
          </span>
        );
      case "disabled":
        return <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-400">Disabled</span>;
    }
  };

  return (
    <div className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg transition hover:border-slate-700">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white">{integration.name}</h3>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              {integration.description}
            </p>
          </div>
          {getStatusBadge()}
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {integration.capabilities.map((cap) => (
            <span
              key={cap}
              className="rounded bg-slate-800/80 px-2 py-0.5 text-[10px] font-medium text-slate-300"
            >
              {cap}
            </span>
          ))}
        </div>

        <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950 p-2.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Inbound Webhook Endpoint:</span>
            <button
              onClick={copyWebhookUrl}
              className="font-semibold text-indigo-400 hover:text-indigo-300"
            >
              {copied ? "Copied! ✓" : "Copy URL"}
            </button>
          </div>
          <code className="mt-1 block truncate text-xs font-mono text-slate-300">
            {integration.webhookPath}
          </code>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-800/80 pt-3">
        <span className="text-[11px] text-slate-500">HMAC-SHA256 & Idempotency Enabled</span>
        <button
          onClick={() => onOpenSimulator(integration.provider)}
          className="rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 px-3 py-1.5 text-xs font-semibold text-indigo-300 transition"
        >
          Test in Simulator →
        </button>
      </div>
    </div>
  );
}
