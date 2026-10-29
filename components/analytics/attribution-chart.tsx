"use client";

import React from "react";
import { ChannelAttribution } from "@/lib/services/analytics-service";

interface AttributionChartProps {
  channels: ChannelAttribution[];
  onSelectChannel: (source: string) => void;
}

export function AttributionChart({ channels, onSelectChannel }: AttributionChartProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white">Marketing Channel Attribution</h3>
          <p className="text-xs text-slate-400">
            Conversion rates and verified clinical revenue across acquisition sources
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="border-b border-slate-800 text-xs font-semibold uppercase text-slate-400">
            <tr>
              <th className="pb-3">Source Channel</th>
              <th className="pb-3 text-right">Inquiries</th>
              <th className="pb-3 text-right">Booked</th>
              <th className="pb-3 text-right">Attended</th>
              <th className="pb-3 text-right">Conversion %</th>
              <th className="pb-3 text-right">Confirmed Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {channels.map((ch) => (
              <tr
                key={ch.source}
                onClick={() => onSelectChannel(ch.source)}
                className="group cursor-pointer hover:bg-slate-800/40"
              >
                <td className="py-3 font-semibold text-white group-hover:text-indigo-400">
                  {ch.label}
                </td>
                <td className="py-3 text-right font-medium text-slate-200">
                  {ch.inquiryCount}
                </td>
                <td className="py-3 text-right text-slate-400">{ch.bookedCount}</td>
                <td className="py-3 text-right text-emerald-400 font-medium">
                  {ch.attendedCount}
                </td>
                <td className="py-3 text-right">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                      ch.conversionRate >= 40
                        ? "bg-emerald-500/10 text-emerald-400"
                        : ch.conversionRate >= 20
                        ? "bg-amber-500/10 text-amber-400"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {ch.conversionRate}%
                  </span>
                </td>
                <td className="py-3 text-right font-bold text-emerald-400">
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
