"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  analyticsService,
  DashboardMetrics,
  AnalyticsFilter,
} from "@/lib/services/analytics-service";
import { ConversionFunnel } from "@/components/analytics/conversion-funnel";
import { AttributionChart } from "@/components/analytics/attribution-chart";
import { LossBreakdown } from "@/components/analytics/loss-breakdown";
import { DrilldownDrawer } from "@/components/analytics/drilldown-drawer";

export default function AnalyticsDashboardPage() {
  const params = useParams();
  const orgSlug = (params?.orgSlug as string) || "hoffman-audiology";
  const orgId = "org-hoffman-01";

  const [filterLocation, setFilterLocation] = useState<string>("all");
  const [filterRange, setFilterRange] = useState<"7d" | "30d" | "90d" | "all">("all");
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  // Drilldown drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTitle, setDrawerTitle] = useState("");
  const [drawerInquiries, setDrawerInquiries] = useState<any[]>([]);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const data = await analyticsService.getExecutiveDashboardMetrics(orgId, {
        locationId: filterLocation,
        dateRange: filterRange,
      });
      setMetrics(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [filterLocation, filterRange]);

  const handleDrilldown = async (
    type: "channel" | "stage" | "loss_reason",
    key: string,
    title: string
  ) => {
    const list = await analyticsService.getMetricDrilldown(orgId, type, key, {
      locationId: filterLocation,
      dateRange: filterRange,
    });
    setDrawerTitle(title);
    setDrawerInquiries(list);
    setDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Filter Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Conversion & Attribution Analytics
          </h1>
          <p className="text-sm text-slate-400">
            Real-time attribution on which marketing channels, clinics, and staff convert inquiries into revenue.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-white focus:border-indigo-500 focus:outline-none"
          >
            <option value="all">All Clinics (Durban & Ballito)</option>
            <option value="loc-dbn-01">Durban Clinic (Musgrave)</option>
            <option value="loc-blt-01">Ballito Clinic</option>
          </select>

          <select
            value={filterRange}
            onChange={(e) => setFilterRange(e.target.value as any)}
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-white focus:border-indigo-500 focus:outline-none"
          >
            <option value="all">All Time</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>
      </div>

      {loading || !metrics ? (
        <div className="p-12 text-center text-sm text-slate-500">
          Calculating practice attribution analytics...
        </div>
      ) : (
        <>
          {/* Top KPI Tiles */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div
              onClick={() => handleDrilldown("stage", "new", "All Inbound Inquiries")}
              className="cursor-pointer rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg hover:border-slate-700 transition"
            >
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Inbound Inquiries
              </div>
              <div className="mt-2 text-2xl font-bold text-white">
                {metrics.totalInquiries}
              </div>
              <div className="mt-1 text-xs text-indigo-400">Click to inspect leads →</div>
            </div>

            <div
              onClick={() => handleDrilldown("stage", "attended", "Attended Appointments")}
              className="cursor-pointer rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg hover:border-slate-700 transition"
            >
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Attended Conversion Rate
              </div>
              <div className="mt-2 text-2xl font-bold text-emerald-400">
                {metrics.overallConversionRate}%
              </div>
              <div className="mt-1 text-xs text-slate-500">
                {metrics.totalAttended} attended of {metrics.totalInquiries} leads
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Confirmed Revenue (ZAR)
              </div>
              <div className="mt-2 text-2xl font-bold text-emerald-400">
                R {(metrics.totalRevenueCents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
              </div>
              <div className="mt-1 text-xs text-slate-500">Auditable clinical billing</div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Avg Response Velocity
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">
                  {metrics.avgResponseMinutes} min
                </span>
                <span className="text-xs font-semibold text-emerald-400">Within 2h SLA</span>
              </div>
              <div className="mt-1 text-xs text-slate-500">Calculated in SAST clinic hours</div>
            </div>
          </div>

          {/* Funnel & Attribution Layout */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ConversionFunnel
              stages={metrics.funnelStages}
              onSelectStage={(stageId) =>
                handleDrilldown("stage", stageId, `Funnel Stage: ${stageId.toUpperCase()}`)
              }
            />

            <AttributionChart
              channels={metrics.channels}
              onSelectChannel={(source) =>
                handleDrilldown("channel", source, `Channel Attribution: ${source.toUpperCase()}`)
              }
            />
          </div>

          {/* Loss Reasons */}
          <LossBreakdown
            lossReasons={metrics.lossReasons}
            onSelectReason={(reason) =>
              handleDrilldown("loss_reason", reason, `Loss Reason: ${reason}`)
            }
          />
        </>
      )}

      {/* Drilldown Drawer */}
      <DrilldownDrawer
        isOpen={drawerOpen}
        title={drawerTitle}
        inquiries={drawerInquiries}
        orgSlug={orgSlug}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
