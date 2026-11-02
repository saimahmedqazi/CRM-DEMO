"use client";

import React from "react";
import { ChannelAttribution } from "@/lib/services/analytics-service";

interface AttributionChartProps {
  channels: ChannelAttribution[];
  onSelectChannel: (source: string) => void;
}

export function AttributionChart({ channels, onSelectChannel }: AttributionChartProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-foreground">Marketing Channel Attribution</h3>
          <p className="text-xs text-muted-foreground">
            Conversion rates and verified clinical revenue across acquisition sources
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-foreground">
          <thead className="border-b border-border text-xs font-semibold uppercase text-muted-foreground">
            <tr>
              <th className="pb-3">Source Channel</th>
              <th className="pb-3 text-right">Inquiries</th>
              <th className="pb-3 text-right">Booked</th>
              <th className="pb-3 text-right">Attended</th>
              <th className="pb-3 text-right">Conversion %</th>
              <th className="pb-3 text-right">Confirmed Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {channels.map((ch) => (
              <tr
                key={ch.source}
                onClick={() => onSelectChannel(ch.source)}
                className="group cursor-pointer hover:bg-muted/40 transition-colors"
              >
                <td className="py-3 font-semibold text-foreground group-hover:text-primary">
                  {ch.label}
                </td>
                <td className="py-3 text-right font-medium text-foreground">
                  {ch.inquiryCount}
                </td>
                <td className="py-3 text-right text-muted-foreground">{ch.bookedCount}</td>
                <td className="py-3 text-right text-emerald-600 dark:text-emerald-400 font-medium">
                  {ch.attendedCount}
                </td>
                <td className="py-3 text-right">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                      ch.conversionRate >= 40
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                        : ch.conversionRate >= 20
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {ch.conversionRate}%
                  </span>
                </td>
                <td className="py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                  R {(ch.revenueCents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
