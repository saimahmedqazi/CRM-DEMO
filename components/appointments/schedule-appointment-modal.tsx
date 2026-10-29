"use client";

import React, { useState } from "react";
import { CreateAppointmentDTO } from "@/lib/services/appointment-service";

interface ScheduleAppointmentModalProps {
  isOpen: boolean;
  orgId: string;
  onClose: () => void;
  onSubmit: (dto: CreateAppointmentDTO) => Promise<void>;
}

export function ScheduleAppointmentModal({
  isOpen,
  orgId,
  onClose,
  onSubmit,
}: ScheduleAppointmentModalProps) {
  const [patientName, setPatientName] = useState("");
  const [title, setTitle] = useState("Diagnostic Hearing Assessment");
  const [appointmentType, setAppointmentType] = useState("hearing_assessment");
  const [locationId, setLocationId] = useState("loc-dbn-01");
  const [appointmentDate, setAppointmentDate] = useState(
    new Date(Date.now() + 24 * 3600 * 1000).toISOString().split("T")[0]
  );
  const [startTime, setStartTime] = useState("09:00");
  const [durationMinutes, setDurationMinutes] = useState("60");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const startDateTime = new Date(`${appointmentDate}T${startTime}:00+02:00`);
      const endDateTime = new Date(startDateTime.getTime() + parseInt(durationMinutes) * 60 * 1000);

      await onSubmit({
        organization_id: orgId,
        contact_id: `cnt-${Math.random().toString(36).substring(2, 8)}`,
        location_id: locationId,
        title: `${title} - ${patientName}`,
        appointment_type: appointmentType,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-lg font-bold text-white">Schedule Appointment</h2>
            <p className="text-xs text-slate-400">Book clinical appointment for Durban or Ballito clinic</p>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Patient Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="e.g. Sipho Ndlovu"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Clinic Location
              </label>
              <select
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="loc-dbn-01">Durban Clinic (Musgrave)</option>
                <option value="loc-blt-01">Ballito Clinic</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Appointment Type
              </label>
              <select
                value={appointmentType}
                onChange={(e) => setAppointmentType(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="hearing_assessment">Diagnostic Audiogram (60m)</option>
                <option value="hearing_aid_fitting">Hearing Aid Fitting (60m)</option>
                <option value="wax_removal">Microsuction Wax Removal (30m)</option>
                <option value="follow_up">Follow-up Consultation (30m)</option>
                <option value="tinnitus_assessment">Tinnitus Assessment (45m)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Date
              </label>
              <input
                type="date"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Duration
              </label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="30">30 min</option>
                <option value="45">45 min</option>
                <option value="60">60 min</option>
                <option value="90">90 min</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-slate-800 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !patientName.trim()}
              className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              {loading ? "Scheduling..." : "Schedule Appointment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
