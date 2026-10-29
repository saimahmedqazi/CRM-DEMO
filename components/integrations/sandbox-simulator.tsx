"use client";

import React, { useState } from "react";

const FIXTURES: Record<string, { label: string; provider: string; path: string; payload: any }> = {
  whatsapp_urgent: {
    label: "WhatsApp: Urgent Hearing Loss Inquiry",
    provider: "whatsapp",
    path: "/api/v1/webhooks/whatsapp",
    payload: {
      object: "whatsapp_business_account",
      entry: [
        {
          id: "WABA_10029",
          changes: [
            {
              field: "messages",
              value: {
                messaging_product: "whatsapp",
                metadata: {
                  display_phone_number: "+27820001122",
                  phone_number_id: "PHONE_ID_TEST",
                },
                contacts: [
                  {
                    profile: { name: "Nandi Mthembu" },
                    wa_id: "27824551029",
                  },
                ],
                messages: [
                  {
                    from: "27824551029",
                    id: `wamid_${Date.now()}`,
                    timestamp: Math.floor(Date.now() / 1000).toString(),
                    type: "text",
                    text: {
                      body: "Hello Dr. Kara Hoffman, my mother experienced sudden hearing loss this morning. Can we book an urgent assessment in Durban?",
                    },
                  },
                ],
              },
            },
          ],
        },
      ],
    },
  },
  meta_lead_ad: {
    label: "Meta Lead Ad: Ballito Free Screening Campaign",
    provider: "meta_ads",
    path: "/api/v1/webhooks/meta_ads",
    payload: {
      entry: [
        {
          id: "PAGE_HOFFMAN_AUDIOLOGY",
          time: Math.floor(Date.now() / 1000),
          changes: [
            {
              field: "leadgen",
              value: {
                leadgen_id: `leadgen_${Date.now()}`,
                form_id: "form_ballito_promo_2026",
                ad_id: "ad_tinnitus_kzn_north",
                created_time: Math.floor(Date.now() / 1000),
                field_data: [
                  { name: "full_name", values: ["Dave van Zyl"] },
                  { name: "phone_number", values: ["+27839994821"] },
                  { name: "email", values: ["dave.vanzyl@workmail.co.za"] },
                  { name: "preferred_clinic", values: ["Ballito Clinic"] },
                ],
              },
            },
          ],
        },
      ],
    },
  },
  phone_missed: {
    label: "Telecom PBX: Missed Inbound Call Durban",
    provider: "phone",
    path: "/api/v1/webhooks/phone",
    payload: {
      call_id: `call_${Date.now()}`,
      caller_number: "0847771234",
      caller_name: "Thabo Cele",
      clinic_did: "031-201-4455 (Durban Musgrave Clinic)",
      call_status: "missed",
      duration_seconds: 0,
      call_time: new Date().toISOString(),
    },
  },
  rest_ingest: {
    label: "REST API: Custom Website Ingest (/api/v1/ingest)",
    provider: "api",
    path: "/api/v1/ingest",
    payload: {
      organizationId: "org-hoffman-01",
      firstName: "Samantha",
      lastName: "Moodley",
      email: "samantha.moodley@gmail.com",
      phone: "+27 82 888 9900",
      locationId: "loc-dbn-01",
      source: "website",
      notes: "Inquired via partner doctor referral widget. Needs paediatric audiology assessment.",
      tags: ["Doctor Referral", "Durban Clinic"],
      utmParams: {
        source: "google_ads",
        campaign: "hearing_tests_durban_2026",
      },
    },
  },
};

export function SandboxSimulator({ initialProvider }: { initialProvider?: string }) {
  const [selectedKey, setSelectedKey] = useState<string>("whatsapp_urgent");
  const [jsonText, setJsonText] = useState(
    JSON.stringify(FIXTURES["whatsapp_urgent"].payload, null, 2)
  );
  const [isDispatching, setIsDispatching] = useState(false);
  const [responseLog, setResponseLog] = useState<any | null>(null);

  const handleSelectPreset = (key: string) => {
    setSelectedKey(key);
    setJsonText(JSON.stringify(FIXTURES[key].payload, null, 2));
    setResponseLog(null);
  };

  const handleDispatch = async () => {
    setIsDispatching(true);
    setResponseLog(null);
    try {
      const fixture = FIXTURES[selectedKey];
      const parsedBody = JSON.parse(jsonText);

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "x-kuro-sandbox": "true",
      };

      if (fixture.path.includes("/ingest")) {
        headers["x-api-key"] = "kuro_live_hoffman_secret_key";
      }

      const res = await fetch(fixture.path, {
        method: "POST",
        headers,
        body: JSON.stringify(parsedBody),
      });

      const data = await res.json();
      setResponseLog({
        status: res.status,
        statusText: res.statusText,
        data,
      });
    } catch (err: any) {
      setResponseLog({
        status: 500,
        error: err?.message || "Failed to dispatch request",
      });
    } finally {
      setIsDispatching(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white">Interactive Webhook Sandbox Simulator</h3>
          <p className="text-xs text-slate-400">
            Dispatch realistic production fixtures directly into the Kuro CRM ingestion pipeline without external credentials.
          </p>
        </div>

        <select
          value={selectedKey}
          onChange={(e) => handleSelectPreset(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-white focus:border-indigo-500 focus:outline-none"
        >
          {Object.entries(FIXTURES).map(([key, item]) => (
            <option key={key} value={key}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Editor Column */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span>Payload Request Body (JSON)</span>
            <span className="font-mono text-[11px] text-indigo-400">
              POST {FIXTURES[selectedKey].path}
            </span>
          </div>

          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            rows={15}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-emerald-400 focus:border-indigo-500 focus:outline-none"
          />

          <button
            onClick={handleDispatch}
            disabled={isDispatching}
            className="w-full rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 disabled:opacity-50 transition"
          >
            {isDispatching ? "Dispatching Webhook..." : "⚡ Dispatch Simulated Ingestion"}
          </button>
        </div>

        {/* Response Column */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span>Ingestion Result Inspector</span>
            {responseLog && (
              <span
                className={`rounded px-2 py-0.5 text-[11px] font-bold ${
                  responseLog.status >= 200 && responseLog.status < 300
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-rose-500/10 text-rose-400"
                }`}
              >
                HTTP {responseLog.status} {responseLog.statusText}
              </span>
            )}
          </div>

          <div className="h-[340px] overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-300">
            {responseLog ? (
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(responseLog.data || responseLog.error, null, 2)}
              </pre>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center text-slate-600">
                <span>Click &quot;Dispatch Simulated Ingestion&quot; to test payload parsing, phone normalization, deduplication, and task triggers.</span>
              </div>
            )}
          </div>

          {responseLog?.data?.success && (
            <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs text-emerald-300">
              ✓ Ingestion verified! A real lead has been captured and is now live in your <strong>Lead Inbox</strong> and <strong>Daily Action Queue</strong>.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
