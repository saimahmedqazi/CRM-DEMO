"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { IntegrationCard, IntegrationInfo } from "@/components/integrations/integration-card";
import { SandboxSimulator } from "@/components/integrations/sandbox-simulator";

const INTEGRATIONS: IntegrationInfo[] = [
  {
    id: "intg-wa",
    name: "WhatsApp Business Cloud API",
    provider: "whatsapp",
    description: "Official Meta WhatsApp Business Cloud API. Captures inbound customer messages, normalizes E.164 phone numbers, and records chat interactions.",
    status: "sandbox_ready",
    capabilities: ["Inbound Chats", "E.164 Normalization", "Auto-Lead Creation", "POPIA Safe"],
    webhookPath: "/api/v1/webhooks/whatsapp",
  },
  {
    id: "intg-meta",
    name: "Meta Lead Ads (Facebook & Instagram)",
    provider: "meta_ads",
    description: "Captures instant form submissions from Facebook and Instagram lead generation ad campaigns with campaign and ad set attribution.",
    status: "sandbox_ready",
    capabilities: ["Instant Forms", "Campaign Attribution", "Location Mapping", "Custom Fields"],
    webhookPath: "/api/v1/webhooks/meta_ads",
  },
  {
    id: "intg-embed",
    name: "Website Embed Lead Form",
    provider: "website",
    description: "Embeddable, responsive lead capture widget with anti-bot honeypot protection, UTM campaign tracking, and POPIA consent handling.",
    status: "active",
    capabilities: ["Honeypot Anti-Spam", "UTM Attribution", "POPIA Compliant", "iFrame Ready"],
    webhookPath: "/embed/hoffman-audiology",
  },
  {
    id: "intg-email",
    name: "Inbound Email Ingestion Gateway",
    provider: "email",
    description: "Processes forwarded inquiry emails and doctor referrals from hospital networks (Mediclinic, Netcare) into structured CRM leads.",
    status: "sandbox_ready",
    capabilities: ["Email Forwarding", "Doctor Referrals", "Audit Preserved", "HTML Parsing"],
    webhookPath: "/api/v1/webhooks/email",
  },
  {
    id: "intg-phone",
    name: "Telecom PBX & VoIP Call Logger",
    provider: "phone",
    description: "Connects to clinic telephone lines (Durban & Ballito DIDs). Automatically registers missed calls as urgent 2-hour SLA tasks.",
    status: "sandbox_ready",
    capabilities: ["Missed Call Alerts", "DID Routing", "Urgent Task Trigger", "Call Durations"],
    webhookPath: "/api/v1/webhooks/phone",
  },
  {
    id: "intg-cal",
    name: "Calendar Sync (Google / Outlook / Calendly)",
    provider: "calendar",
    description: "Bilateral calendar synchronization with phone/email reconciliation and ambiguous booking review queue.",
    status: "sandbox_ready",
    capabilities: ["Idempotent Sync", "Zero Double-Counting", "Review Queue", "Multi-Calendar"],
    webhookPath: "/api/v1/webhooks/calendar",
  },
];

export default function IntegrationsPage() {
  const params = useParams();
  const orgSlug = (params?.orgSlug as string) || "hoffman-audiology";
  const [activeTab, setActiveTab] = useState<"channels" | "simulator" | "api">("channels");
  const [simulatorProvider, setSimulatorProvider] = useState<string>("whatsapp");

  const openSimulatorFor = (provider: string) => {
    setSimulatorProvider(provider);
    setActiveTab("simulator");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Integrations & Ingestion Hub
          </h1>
          <p className="text-sm text-slate-400">
            Pluggable multi-channel ingestion adapters, HMAC webhook security, and credentials-free testing simulator.
          </p>
        </div>
      </div>

      {/* Demonstration Sandbox Notice */}
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-200">
        <div className="font-semibold text-white mb-1 flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
          <span>Sales Demo Safety Notice: Simulated Test Harness Active</span>
        </div>
        <p className="text-slate-300 leading-relaxed">
          External third-party channels (Meta WhatsApp Cloud API, Meta Lead Ads, Telecom PBX, and Calendar Sync) are equipped with clean mock adapters and sandbox webhook simulators. In demo mode, no real-world phone calls, SMS charges, WhatsApp messages, or external calendar edits take place. Use the <strong>Webhook Sandbox Simulator</strong> below to test real-time inquiry ingestion.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab("channels")}
          className={`border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
            activeTab === "channels"
              ? "border-indigo-500 text-indigo-400"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          Connected Channels ({INTEGRATIONS.length})
        </button>

        <button
          onClick={() => setActiveTab("simulator")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
            activeTab === "simulator"
              ? "border-indigo-500 text-indigo-400"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <span>⚡ Webhook Sandbox Simulator</span>
          <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-xs text-indigo-300">
            Interactive
          </span>
        </button>

        <button
          onClick={() => setActiveTab("api")}
          className={`border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
            activeTab === "api"
              ? "border-indigo-500 text-indigo-400"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          API Keys & Ingest Endpoint
        </button>
      </div>

      {/* Tab 1: Channels */}
      {activeTab === "channels" && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {INTEGRATIONS.map((intg) => (
            <IntegrationCard
              key={intg.id}
              integration={intg}
              onOpenSimulator={openSimulatorFor}
            />
          ))}
        </div>
      )}

      {/* Tab 2: Simulator */}
      {activeTab === "simulator" && (
        <SandboxSimulator initialProvider={simulatorProvider} />
      )}

      {/* Tab 3: API & Embed Code */}
      {activeTab === "api" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
            <h3 className="text-base font-bold text-white">Embeddable Lead Capture Widget</h3>
            <p className="mt-1 text-xs text-slate-400">
              Copy this snippet to embed the responsive lead capture form on your website (e.g. WordPress, Webflow, Squarespace):
            </p>
            <div className="mt-4 rounded-lg bg-slate-950 p-4 font-mono text-xs text-emerald-400">
              {`<iframe\n  src="${typeof window !== "undefined" ? window.location.origin : ""}/embed/${orgSlug}"\n  width="100%"\n  height="720"\n  frameborder="0"\n  style="border: none; border-radius: 16px;"\n  title="Hoffman Audiology Appointment Form"\n></iframe>`}
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
            <h3 className="text-base font-bold text-white">Public Ingest REST API</h3>
            <p className="mt-1 text-xs text-slate-400">
              Create leads directly from backend servers, custom portals, or Zapier / Make webhooks using your workspace API key:
            </p>

            <div className="mt-4 space-y-2">
              <div className="text-xs font-semibold text-slate-300">cURL Request Example:</div>
              <div className="rounded-lg bg-slate-950 p-4 font-mono text-xs text-emerald-400 overflow-x-auto">
{`curl -X POST "${typeof window !== "undefined" ? window.location.origin : ""}/api/v1/ingest" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: kuro_live_hoffman_secret_key" \\
  -d '{
    "organizationId": "org-hoffman-01",
    "firstName": "Sindi",
    "lastName": "Khumalo",
    "phone": "+27821234567",
    "email": "sindi.khumalo@example.co.za",
    "locationId": "loc-dbn-01",
    "source": "website",
    "notes": "Patient requested consultation"
  }'`}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
