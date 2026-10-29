"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  appointmentService,
  Appointment,
  UnmatchedBooking,
  AppointmentOutcome,
  CreateAppointmentDTO,
} from "@/lib/services/appointment-service";
import { AppointmentList } from "@/components/appointments/appointment-list";
import { UnmatchedQueue } from "@/components/appointments/unmatched-queue";
import { ScheduleAppointmentModal } from "@/components/appointments/schedule-appointment-modal";
import { AppointmentOutcomeModal } from "@/components/appointments/appointment-outcome-modal";

export default function AppointmentsPage() {
  const params = useParams();
  const orgSlug = (params?.orgSlug as string) || "hoffman-audiology";
  const orgId = "org-hoffman-01";

  const [activeTab, setActiveTab] = useState<"appointments" | "unmatched">("appointments");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [unmatchedBookings, setUnmatchedBookings] = useState<UnmatchedBooking[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [outcomeAppointment, setOutcomeAppointment] = useState<Appointment | null>(null);

  const refreshData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/appointments?orgId=${orgId}`);
      if (res.ok) {
        const data = await res.json();
        setAppointments(data.appointments);
        setUnmatchedBookings(data.unmatchedBookings);
        setLoading(false);
        return;
      }
    } catch {
      // Fallback
    }
    try {
      const appts = await appointmentService.listAppointments(orgId);
      const unmatched = await appointmentService.listUnmatchedBookings(orgId);
      setAppointments(appts);
      setUnmatchedBookings(unmatched);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [orgSlug]);

  const handleCreateAppointment = async (dto: CreateAppointmentDTO) => {
    try {
      await fetch("/api/v1/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", orgId, ...dto }),
      });
    } catch {
      await appointmentService.createAppointment(dto);
    }
    await refreshData();
  };

  const handleRecordOutcome = async (
    outcome: AppointmentOutcome,
    notes: string,
    revenueCents: number
  ) => {
    if (!outcomeAppointment) return;
    try {
      await fetch("/api/v1/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "record_outcome",
          orgId,
          appointmentId: outcomeAppointment.id,
          outcome,
          outcomeNotes: notes,
          revenueCents,
        }),
      });
    } catch {
      await appointmentService.recordOutcome(
        orgId,
        outcomeAppointment.id,
        outcome,
        notes,
        revenueCents
      );
    }
    setOutcomeAppointment(null);
    await refreshData();
  };

  const handleMarkNoShow = async (appointmentId: string) => {
    await appointmentService.markNoShow(orgId, appointmentId);
    await refreshData();
  };

  const handleCancelAppointment = async (appointmentId: string, reason: string) => {
    await appointmentService.cancelAppointment(orgId, appointmentId, reason);
    await refreshData();
  };

  const handleResolveUnmatched = async (
    unmatchedId: string,
    action: "match_existing" | "create_new" | "ignore",
    targetContactId?: string
  ) => {
    try {
      await fetch("/api/v1/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "resolve_unmatched",
          orgId,
          unmatchedId,
          resolutionAction: action === "create_new" ? "create_new_contact" : action,
          targetContactId,
        }),
      });
    } catch {
      await appointmentService.resolveUnmatchedBooking(
        orgId,
        unmatchedId,
        action === "create_new" ? "create_new_contact" : action,
        targetContactId
      );
    }
    await refreshData();
  };

  // KPIs
  const totalAttended = appointments.filter((a) => a.status === "attended").length;
  const totalNoShow = appointments.filter((a) => a.status === "no_show").length;
  const totalCompletedOrAttended = totalAttended + totalNoShow;
  const attendanceRate =
    totalCompletedOrAttended > 0
      ? Math.round((totalAttended / totalCompletedOrAttended) * 100)
      : 100;
  const pendingUnmatchedCount = unmatchedBookings.filter(
    (u) => u.resolution_status === "pending"
  ).length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Appointments & Clinical Outcomes
          </h1>
          <p className="text-sm text-slate-400">
            Track clinic schedules, attendance rates, verified clinical outcomes, and external calendar reconciliation.
          </p>
        </div>

        <button
          onClick={() => setIsScheduleOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition"
        >
          <span>+</span> Schedule Appointment
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total Appointments
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{appointments.length}</div>
          <div className="mt-1 text-xs text-slate-500">Scheduled across clinics</div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Attendance Rate
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-400">{attendanceRate}%</div>
          <div className="mt-1 text-xs text-slate-500">{totalAttended} attended, {totalNoShow} no-shows</div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Verified Hearing Aid Revenue
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-400">
            R {(appointments.reduce((sum, a) => sum + (a.revenue_cents || 0), 0) / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-1 text-xs text-slate-500">Confirmed clinical outcomes</div>
        </div>

        <div
          onClick={() => setActiveTab("unmatched")}
          className={`cursor-pointer rounded-xl border p-5 shadow-lg transition ${
            pendingUnmatchedCount > 0
              ? "border-amber-500/50 bg-amber-500/10 hover:bg-amber-500/20"
              : "border-slate-800 bg-slate-900/60"
          }`}
        >
          <div className="text-xs font-semibold uppercase tracking-wider text-amber-400">
            Unmatched Review Queue
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{pendingUnmatchedCount}</span>
            {pendingUnmatchedCount > 0 && (
              <span className="text-xs font-semibold text-amber-400">Needs Review</span>
            )}
          </div>
          <div className="mt-1 text-xs text-slate-400">Ambiguous calendar bookings</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab("appointments")}
          className={`border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
            activeTab === "appointments"
              ? "border-indigo-500 text-indigo-400"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          Scheduled Appointments ({appointments.length})
        </button>
        <button
          onClick={() => setActiveTab("unmatched")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
            activeTab === "unmatched"
              ? "border-amber-500 text-amber-400"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <span>Unmatched Review Queue</span>
          {pendingUnmatchedCount > 0 && (
            <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-300">
              {pendingUnmatchedCount}
            </span>
          )}
        </button>
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="p-8 text-center text-sm text-slate-500">Loading appointments...</div>
      ) : activeTab === "appointments" ? (
        <AppointmentList
          appointments={appointments}
          onOpenOutcomeModal={(appt) => setOutcomeAppointment(appt)}
          onMarkNoShow={handleMarkNoShow}
          onCancelAppointment={handleCancelAppointment}
        />
      ) : (
        <UnmatchedQueue
          unmatchedBookings={unmatchedBookings}
          onResolve={handleResolveUnmatched}
        />
      )}

      {/* Modals */}
      <ScheduleAppointmentModal
        isOpen={isScheduleOpen}
        orgId={orgId}
        onClose={() => setIsScheduleOpen(false)}
        onSubmit={handleCreateAppointment}
      />

      <AppointmentOutcomeModal
        isOpen={!!outcomeAppointment}
        appointment={outcomeAppointment}
        onClose={() => setOutcomeAppointment(null)}
        onSubmit={handleRecordOutcome}
      />
    </div>
  );
}
