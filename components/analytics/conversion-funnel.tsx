"use client";

import React from "react";
import { FunnelStage } from "@/lib/services/analytics-service";

interface ConversionFunnelProps {
  stages: FunnelStage[];
  onSelectStage: (stageId: string) => void;
}

export function ConversionFunnel({ stages, onSelectStage }: ConversionFunnelProps) {
  const getStageColor = (index: number) => {
    switch (index) {
      case 0:
        return "from-blue-600 to-blue-700 border-blue-500/40";
      case 1:
        return "from-indigo-600 to-indigo-700 border-indigo-500/40";
      case 2:
        return "from-purple-600 to-purple-700 border-purple-500/40";
      case 3:
        return "from-emerald-600 to-emerald-700 border-emerald-500/40";
      default:
        return "from-slate-700 to-slate-800 border-slate-600";
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white">Inquiry-to-Outcome Funnel</h3>
          <p className="text-xs text-slate-400">
            Progression from initial inquiry to confirmed attended appointment
          </p>
        </div>
        <span className="text-xs text-indigo-400">Click any stage to drill down</span>
      </div>

      <div className="space-y-4">
        {stages.map((stage, idx) => {
          const widthPercent = Math.max(25, stage.conversionFromTop);
          return (
            <div
              key={stage.id}
              onClick={() => onSelectStage(stage.id)}
              className="group cursor-pointer rounded-xl border border-transparent p-2 transition hover:border-slate-700 hover:bg-slate-800/40"
            >
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200 group-hover:text-white">
                  {stage.label}
                </span>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-white">{stage.count} leads</span>
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-indigo-300">
                    {stage.conversionFromTop}% of total
                  </span>
                </div>
              </div>

              <div className="h-6 w-full overflow-hidden rounded-lg bg-slate-800/80 p-0.5">
                <div
                  className={`h-full rounded-md bg-gradient-to-r ${getStageColor(
                    idx
                  )} transition-all duration-500`}
                  style={{ width: `${widthPercent}%` }}
                />
              </div>

              {idx > 0 && (
                <div className="mt-1 text-[11px] text-slate-500">
                  ↳ {stage.conversionFromPrevious}% progressed from previous step
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
