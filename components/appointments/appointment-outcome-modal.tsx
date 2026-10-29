"use client";

import React, { useState } from "react";
import { Appointment, AppointmentOutcome } from "@/lib/services/appointment-service";

interface AppointmentOutcomeModalProps {
  isOpen: boolean;
  appointment: Appointment | null;
  onClose: () => void;
  onSubmit: (outcome: AppointmentOutcome, notes: string, revenueCents: number) => Promise<void>;
}

export function AppointmentOutcomeModal({
  isOpen,
  appointment,
  onClose,
  onSubmit,
}: AppointmentOutcomeModalProps) {
  const [outcome, setOutcome] = useState<AppointmentOutcome>("hearing_aid_fitted");
  const [notes, setNotes] = useState("");
  const [revenueRands, setRevenueRands] = useState("0");
  const [loading, setLoading] = useState(false);

  if (!isOpen || !appointment) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const revenueCents = Math.round(parseFloat(revenueRands || "0") * 100);
      await onSubmit(outcome, notes, revenueCents);
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
            <h2 className="text-lg font-bold text-white">Record Appointment Outcome</h2>
            <p className="text-xs text-slate-400">
              {appointment.title}
            </p>
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
              Clinical / Commercial Outcome <span className="text-rose-500">*</span>
            </label>
            <select
              value={outcome}
              onChange={(e) => setOutcome(e.target.value as AppointmentOutcome)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              required
            >
              <option value="hearing_aid_fitted">Hearing Aid Fitted & Dispensed</option>
              <option value="assessment_completed">Diagnostic Assessment Completed (No Sale)</option>
              <option value="follow_up_advised">Follow-up Consultation Advised</option>
              <option value="wax_cleared">Microsuction Cerumen Removal Completed</option>
              <option value="medical_referral">ENT / Medical Specialist Referral</option>
              <option value="other">Other Outcome</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Verified Revenue (ZAR Rands)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-sm font-semibold text-slate-400">R</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={revenueRands}
                onChange={(e) => setRevenueRands(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 py-2 pl-8 pr-3 text-sm text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Enter verified billing amount (e.g. R 42000 for binaural premium hearing aid package).
            </p>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Clinical & Consultation Notes <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="e.g. Patient accepted Phonak Lumity 90 trial. Real-ear measurements within target..."
              className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              required
            />
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
              disabled={loading || !notes.trim()}
              className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
            >
              {loading ? "Recording..." : "Save Verified Outcome"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
