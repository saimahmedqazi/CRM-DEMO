"use client";

import React from "react";
import { LossReasonStat } from "@/lib/services/analytics-service";

interface LossBreakdownProps {
  lossReasons: LossReasonStat[];
  onSelectReason: (reason: string) => void;
}

export function LossBreakdown({ lossReasons, onSelectReason }: LossBreakdownProps) {
  if (lossReasons.length === 0) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
        <h3 className="text-base font-bold text-white">Loss Reason Diagnostics</h3>
        <p className="mt-2 text-xs text-slate-400">
          No lost inquiries recorded in this period. Great retention!
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white">Loss Reason Diagnostics</h3>
          <p className="text-xs text-slate-400">
            Documented reasons why inquiries did not convert into booked appointments
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {lossReasons.map((item) => (
          <div
            key={item.reason}
            onClick={() => onSelectReason(item.reason)}
            className="group cursor-pointer rounded-lg border border-transparent p-2 transition hover:border-slate-700 hover:bg-slate-800/40"
          >
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 group-hover:text-rose-400">
                {item.reason}
              </span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">{item.count} leads</span>
                <span className="text-[11px] text-slate-400">({item.percentage}%)</span>
              </div>
            </div>

            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-rose-500 to-rose-600 transition-all duration-500"
                style={{ width: `${Math.max(5, item.percentage)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
