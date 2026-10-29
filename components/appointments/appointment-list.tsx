"use client";

import React, { useState } from "react";
import { Appointment } from "@/lib/services/appointment-service";

interface AppointmentListProps {
  appointments: Appointment[];
  onOpenOutcomeModal: (appointment: Appointment) => void;
  onMarkNoShow: (appointmentId: string) => Promise<void>;
  onCancelAppointment: (appointmentId: string, reason: string) => Promise<void>;
}

export function AppointmentList({
  appointments,
  onOpenOutcomeModal,
  onMarkNoShow,
  onCancelAppointment,
}: AppointmentListProps) {
  const [filterLocation, setFilterLocation] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filtered = appointments.filter((a) => {
    if (filterLocation !== "all" && a.location_id !== filterLocation) return false;
    if (filterStatus !== "all" && a.status !== filterStatus) return false;
    return true;
  });

  const getStatusBadge = (status: Appointment["status"]) => {
    switch (status) {
      case "scheduled":
        return <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-400">Scheduled</span>;
      case "confirmed":
        return <span className="rounded-full bg-purple-500/10 px-2.5 py-0.5 text-xs font-semibold text-purple-400">Confirmed</span>;
      case "attended":
        return <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">Attended</span>;
      case "no_show":
        return <span className="rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-400">No-Show</span>;
      case "cancelled":
        return <span className="rounded-full bg-slate-700 px-2.5 py-0.5 text-xs font-semibold text-slate-400">Cancelled</span>;
    }
  };

  const getOutcomeBadge = (outcome?: Appointment["outcome"]) => {
    if (!outcome) return null;
    const labels: Record<string, string> = {
      hearing_aid_fitted: "Hearing Aid Fitted",
      assessment_completed: "Assessment Done",
      follow_up_advised: "Follow-up Advised",
      medical_referral: "ENT Referral",
      wax_cleared: "Wax Cleared",
      other: "Outcome Logged",
    };
    return (
      <span className="rounded-md bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
        ✓ {labels[outcome] || outcome}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <select
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
          >
            <option value="all">All Locations</option>
            <option value="loc-dbn-01">Durban Clinic</option>
            <option value="loc-blt-01">Ballito Clinic</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="confirmed">Confirmed</option>
            <option value="attended">Attended</option>
            <option value="no_show">No-Show</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <span className="text-xs text-slate-400">
          Showing {filtered.length} of {appointments.length} appointments
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-800/50 text-xs font-semibold uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3">Appointment Title</th>
                <th className="px-4 py-3">Clinic</th>
                <th className="px-4 py-3">Date & Time (SAST)</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Outcome & Revenue</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((appt) => {
                const startTime = new Date(appt.start_time);
                return (
                  <tr key={appt.id} className="hover:bg-slate-800/30">
                    <td className="px-4 py-3.5 font-medium text-white">
                      <div>{appt.title}</div>
                      <div className="text-[11px] text-slate-400 capitalize">
                        {appt.appointment_type.replace(/_/g, " ")}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs">
                      {appt.location_id?.includes("blt") ? (
                        <span className="rounded bg-teal-500/10 px-2 py-0.5 font-medium text-teal-400">
                          Ballito
                        </span>
                      ) : (
                        <span className="rounded bg-indigo-500/10 px-2 py-0.5 font-medium text-indigo-400">
                          Durban
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-300">
                      <div>{startTime.toLocaleDateString("en-ZA", { timeZone: "Africa/Johannesburg" })}</div>
                      <div className="text-slate-500">
                        {startTime.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Johannesburg" })}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      {getStatusBadge(appt.status)}
                    </td>
                    <td className="px-4 py-3.5 text-xs">
                      {appt.outcome ? (
                        <div className="space-y-1">
                          {getOutcomeBadge(appt.outcome)}
                          {appt.revenue_cents ? (
                            <div className="font-semibold text-emerald-400">
                              R {(appt.revenue_cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
                            </div>
                          ) : null}
                        </div>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {appt.status !== "attended" && (
                          <button
                            onClick={() => onOpenOutcomeModal(appt)}
                            className="rounded bg-emerald-600/80 hover:bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white transition"
                          >
                            Record Outcome
                          </button>
                        )}
                        {appt.status !== "no_show" && appt.status !== "attended" && (
                          <button
                            onClick={() => onMarkNoShow(appt.id)}
                            className="rounded border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 px-2.5 py-1 text-xs font-semibold text-rose-400 transition"
                          >
                            No-Show
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
