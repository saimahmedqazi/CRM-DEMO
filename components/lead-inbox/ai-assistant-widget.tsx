"use client";

import React, { useState } from "react";
import { GroqAIProvider } from "@/lib/ai/groq-provider";

interface AIAssistantWidgetProps {
  patientName: string;
  patientPhone?: string | null;
  patientEmail?: string | null;
  source: string;
  notes?: string | null;
  clinicLocation?: string;
}

export function AIAssistantWidget({
  patientName,
  patientPhone,
  patientEmail,
  source,
  notes,
  clinicLocation,
}: AIAssistantWidgetProps) {
  const [draft, setDraft] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [redactions, setRedactions] = useState<string[]>([]);

  const handleGenerateDraft = async () => {
    setIsGenerating(true);
    try {
      const res = await GroqAIProvider.generateFollowUpDraft({
        orgId: "org-hoffman-01",
        patientName,
        patientPhone,
        patientEmail,
        source,
        notes,
        clinicLocation,
        isOptedIn: false, // Privacy default
      });
      setDraft(res.draftText);
      setRedactions(res.redactionsApplied);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-indigo-500/30 bg-slate-900/80 p-4 shadow-lg space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold">
            ✦
          </span>
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">
            AI Clinical Assistant
          </h4>
        </div>
        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
          🛡️ POPIA Protected
        </span>
      </div>

      <p className="text-[11px] text-slate-400 leading-relaxed">
        Draft empathetic clinical follow-up replies and consultation summaries. All personal health identifiers (names, SA IDs, phone numbers) are masked before processing.
      </p>

      {!draft ? (
        <div className="pt-1">
          <button
            onClick={handleGenerateDraft}
            disabled={isGenerating}
            className="w-full rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 py-2 text-xs font-semibold text-indigo-300 transition"
          >
            {isGenerating ? "Redacting PII & Drafting..." : "✨ Generate Suggested Follow-up Draft"}
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Proposed Follow-up Message (Human Review Required):</span>
            <button
              onClick={handleCopy}
              className="font-semibold text-indigo-400 hover:text-indigo-300"
            >
              {copied ? "Copied! ✓" : "Copy to Clipboard"}
            </button>
          </div>

          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
          />

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-slate-500">
              {redactions.length > 0
                ? `Redactions applied: ${redactions.join(", ")}`
                : "No sensitive PII tokens detected"}
            </span>

            <button
              onClick={() => setDraft("")}
              className="text-[11px] text-slate-400 hover:text-slate-300"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
