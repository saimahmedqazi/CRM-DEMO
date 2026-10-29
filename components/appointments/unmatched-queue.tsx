"use client";

import React, { useState } from "react";
import { UnmatchedBooking } from "@/lib/services/appointment-service";

interface UnmatchedQueueProps {
  unmatchedBookings: UnmatchedBooking[];
  onResolve: (
    unmatchedId: string,
    action: "match_existing" | "create_new" | "ignore",
    targetContactId?: string
  ) => Promise<void>;
}

export function UnmatchedQueue({ unmatchedBookings, onResolve }: UnmatchedQueueProps) {
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const handleAction = async (
    id: string,
    action: "match_existing" | "create_new" | "ignore"
  ) => {
    setResolvingId(id);
    try {
      await onResolve(id, action);
    } finally {
      setResolvingId(null);
    }
  };

  const pendingItems = unmatchedBookings.filter((u) => u.resolution_status === "pending");

  if (pendingItems.length === 0) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-12 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
          ✓
        </div>
        <h3 className="text-base font-semibold text-white">Review Queue Clean</h3>
        <p className="mt-1 text-xs text-slate-400">
          All external calendar events (Google Calendar, Outlook, Calendly) have been reconciled with zero attribution ambiguity.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">
            Unmatched Booking Review Queue ({pendingItems.length})
          </h3>
          <p className="text-xs text-slate-400">
            Incoming external appointments that could not be uniquely matched to an existing contact by phone or email. Review to prevent double-counting.
          </p>
        </div>
      </div>

      <div className="divide-y divide-slate-800 rounded-xl border border-amber-500/30 bg-slate-900/60 shadow-lg">
        {pendingItems.map((item) => (
          <div key={item.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  {item.external_provider}
                </span>
                <span className="text-xs text-slate-400">
                  ID: {item.external_calendar_id}
                </span>
              </div>
              <h4 className="text-sm font-bold text-white">{item.title}</h4>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300">
                <span>Attendee: <strong className="text-white">{item.attendee_name || "Unknown"}</strong></span>
                {item.attendee_phone && (
                  <span>Phone: <strong className="text-indigo-400">{item.attendee_phone}</strong></span>
                )}
                {item.attendee_email && (
                  <span>Email: <strong className="text-indigo-400">{item.attendee_email}</strong></span>
                )}
                <span>Time: {new Date(item.start_time).toLocaleString("en-ZA", { timeZone: "Africa/Johannesburg" })}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={resolvingId === item.id}
                onClick={() => handleAction(item.id, "create_new")}
                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
              >
                + Create New Patient
              </button>
              <button
                disabled={resolvingId === item.id}
                onClick={() => handleAction(item.id, "ignore")}
                className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 disabled:opacity-50"
              >
                Dismiss
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
