"use client";

import React, { useState } from "react";

const FIXTURES: Record<string, { label: string; provider: string; path: string; payload: any }> = {
  whatsapp_urgent: {
    label: "[Simulated] WhatsApp: Urgent Hearing Loss Inquiry",
    provider: "whatsapp",
    path: "/api/v1/webhooks/whatsapp",
    payload: {
      object: "whatsapp_business_account",
      entry: [
        {
          id: "WABA_SIMULATED_10029",
          changes: [
            {
              field: "messages",
              value: {
                messaging_product: "whatsapp",
                metadata: {
                  display_phone_number: "+27820000001",
                  phone_number_id: "PHONE_ID_DEMO",
                },
                contacts: [
                  {
                    profile: { name: "Nandi Mthembu (Demo)" },
                    wa_id: "27820000110",
                  },
                ],
                messages: [
                  {
                    from: "27820000110",
                    id: `wamid_synthetic_${Date.now()}`,
                    timestamp: Math.floor(Date.now() / 1000).toString(),
                    type: "text",
                    text: {
                      body: "[SYNTHETIC DEMO CHAT] Hello Dr. Kara Hoffman, my mother experienced sudden hearing loss this morning. Can we book an urgent assessment at your Durban Musgrave clinic?",
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
    label: "[Simulated] Meta Lead Ad: Ballito Free Screening Campaign",
    provider: "meta_ads",
    path: "/api/v1/webhooks/meta_ads",
    payload: {
      entry: [
        {
          id: "PAGE_HOFFMAN_AUDIOLOGY_DEMO",
          time: Math.floor(Date.now() / 1000),
          changes: [
            {
              field: "leadgen",
              value: {
                leadgen_id: `leadgen_synthetic_${Date.now()}`,
                form_id: "form_ballito_promo_2026",
                ad_id: "ad_tinnitus_kzn_north",
                created_time: Math.floor(Date.now() / 1000),
                field_data: [
                  { name: "full_name", values: ["Dave van Zyl (Demo)"] },
                  { name: "phone_number", values: ["+27820000111"] },
                  { name: "email", values: ["dave.vanzyl@demo.example.co.za"] },
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
    label: "[Simulated] Telecom PBX: Missed Inbound Call Durban",
    provider: "phone",
    path: "/api/v1/webhooks/phone",
    payload: {
      call_id: `call_synthetic_${Date.now()}`,
      caller_number: "+27820000112",
      caller_name: "Thabo Cele (Demo)",
      clinic_did: "+27 31 201 0001 (Durban Musgrave Clinic)",
      call_status: "missed",
      duration_seconds: 0,
      call_time: new Date().toISOString(),
    },
  },
  rest_ingest: {
    label: "[Simulated] REST API: Custom Website Ingest (/api/v1/ingest)",
    provider: "api",
    path: "/api/v1/ingest",
    payload: {
      organizationId: "org-hoffman-01",
      firstName: "Samantha (Demo)",
      lastName: "Moodley",
      email: "samantha.moodley@demo.example.co.za",
      phone: "+27 82 000 0113",
      locationId: "loc-dbn-01",
      source: "website",
      notes: "[SYNTHETIC DEMO] Inquired via partner doctor referral widget. Needs paediatric audiology assessment.",
      tags: ["Doctor Referral", "Durban Clinic", "Synthetic Demo"],
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

    const fixture = FIXTURES[selectedKey];
    try {
      let parsedPayload: any;
      try {
        parsedPayload = JSON.parse(jsonText);
      } catch (err: any) {
        setResponseLog({ error: "Invalid JSON format in payload editor", details: err?.message });
        setIsDispatching(false);
        return;
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "x-kuro-sandbox": "true", // Safe demo bypass header
      };

      if (fixture.provider === "api") {
        headers["x-api-key"] = "kuro_dev_sandbox_key";
      }

      const res = await fetch(fixture.path, {
        method: "POST",
        headers,
        body: JSON.stringify(parsedPayload),
      });

      const data = await res.json();
      setResponseLog({
        status: res.status,
        statusText: res.statusText,
        body: data,
        timestamp: new Date().toLocaleTimeString(),
      });
    } catch (err: any) {
      setResponseLog({
        error: "Dispatch failed",
        message: err?.message,
        timestamp: new Date().toLocaleTimeString(),
      });
    } finally {
      setIsDispatching(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-2xl backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-base font-bold text-white">Simulated Integration Sandbox</h3>
            <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-amber-300 uppercase tracking-wider">
              Simulated Demo Mode
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-400">
            Simulate incoming patient inquiries from WhatsApp, Meta Ads, and Telephony PBX with zero live credentials or real phone charges.
          </p>
        </div>

        <button
          onClick={handleDispatch}
          disabled={isDispatching}
          className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 disabled:opacity-50 transition"
        >
          {isDispatching ? (
            <span>Simulating Webhook...</span>
          ) : (
            <>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Dispatch Synthetic Webhook</span>
            </>
          )}
        </button>
      </div>

      {/* Preset Pickers */}
      <div className="mt-4 flex flex-wrap gap-2">
        {Object.entries(FIXTURES).map(([key, f]) => (
          <button
            key={key}
            onClick={() => handleSelectPreset(key)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
              selectedKey === key
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-300 font-semibold"
                : "border-slate-800 bg-slate-800/60 text-slate-400 hover:border-slate-700 hover:text-slate-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Payload Editor & Response Log */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span className="font-semibold text-slate-300">Target Webhook Endpoint:</span>
            <code className="text-emerald-400 font-mono text-[11px]">{FIXTURES[selectedKey].path}</code>
          </div>
          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            rows={12}
            className="w-full rounded-lg border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-slate-200 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div>
          <div className="text-xs font-semibold text-slate-300 mb-1.5">
            Real-time Ingestion Response:
          </div>
          <div className="h-[248px] overflow-y-auto rounded-lg border border-slate-800 bg-slate-950 p-3 font-mono text-xs">
            {responseLog ? (
              <pre className="text-slate-200 whitespace-pre-wrap">
                {JSON.stringify(responseLog, null, 2)}
              </pre>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center text-slate-500">
                <svg className="mb-2 h-8 w-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Click &quot;Dispatch Synthetic Webhook&quot; to test inbound inquiry creation</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
