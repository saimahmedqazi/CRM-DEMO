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
    <div className="rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/40 dark:bg-indigo-950/20 p-4 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
            ✦
          </span>
          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
            AI Clinical Assistant
          </h4>
        </div>
        <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 text-[10px] font-semibold">
          🛡️ POPIA Protected
        </span>
      </div>

      <p className="text-[11px] text-muted-foreground leading-relaxed">
        Draft empathetic clinical follow-up replies and consultation summaries. All personal health identifiers (names, SA IDs, phone numbers) are masked before processing.
      </p>

      {!draft ? (
        <div className="pt-1">
          <button
            onClick={handleGenerateDraft}
            disabled={isGenerating}
            className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs py-2 text-xs font-semibold transition"
          >
            {isGenerating ? "Redacting PII & Drafting..." : "✨ Generate Suggested Follow-up Draft"}
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Proposed Follow-up Message (Human Review Required):</span>
            <button
              onClick={handleCopy}
              className="font-semibold text-primary hover:underline"
            >
              {copied ? "Copied! ✓" : "Copy to Clipboard"}
            </button>
          </div>

          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-input bg-background p-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
          />

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-muted-foreground">
              {redactions.length > 0
                ? `Redactions applied: ${redactions.join(", ")}`
                : "No sensitive PII tokens detected"}
            </span>

            <button
              onClick={() => setDraft("")}
              className="text-[11px] text-muted-foreground hover:text-foreground"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
