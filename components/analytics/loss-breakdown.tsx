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
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-base font-bold text-foreground">Loss Reason Diagnostics</h3>
        <p className="mt-2 text-xs text-muted-foreground">
          No lost inquiries recorded in this period. Great retention!
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-foreground">Loss Reason Diagnostics</h3>
          <p className="text-xs text-muted-foreground">
            Documented reasons why inquiries did not convert into booked appointments
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {lossReasons.map((item) => (
          <div
            key={item.reason}
            onClick={() => onSelectReason(item.reason)}
            className="group cursor-pointer rounded-lg border border-transparent p-2 transition hover:border-border hover:bg-muted/40"
          >
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground group-hover:text-rose-600">
                {item.reason}
              </span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground">{item.count} leads</span>
                <span className="text-[11px] text-muted-foreground">({item.percentage}%)</span>
              </div>
            </div>

            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-rose-500 transition-all duration-500"
                style={{ width: `${Math.max(5, item.percentage)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
