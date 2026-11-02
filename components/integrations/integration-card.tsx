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
        return <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">Disabled</span>;
    }
  };

  return (
    <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-sm transition hover:border-primary/40">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-foreground">{integration.name}</h3>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              {integration.description}
            </p>
          </div>
          {getStatusBadge()}
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {integration.capabilities.map((cap) => (
            <span
              key={cap}
              className="rounded bg-muted px-2 py-0.5 text-[10px] font-medium text-foreground"
            >
              {cap}
            </span>
          ))}
        </div>

        <div className="mt-4 rounded-lg border border-border bg-muted/30 p-2.5">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Inbound Webhook Endpoint:</span>
            <button
              onClick={copyWebhookUrl}
              className="font-semibold text-primary hover:underline"
            >
              {copied ? "Copied! ✓" : "Copy URL"}
            </button>
          </div>
          <code className="mt-1 block truncate text-xs font-mono text-foreground">
            {integration.webhookPath}
          </code>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-border pt-3">
        <span className="text-[11px] text-muted-foreground">HMAC-SHA256 & Idempotency Enabled</span>
        <button
          onClick={() => onOpenSimulator(integration.provider)}
          className="rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/20 px-3 py-1.5 text-xs font-semibold text-primary transition"
        >
          Test in Simulator →
        </button>
      </div>
    </div>
  );
}
