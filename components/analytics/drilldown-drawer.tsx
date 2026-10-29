"use client";

import React from "react";
import Link from "next/link";

interface DrilldownDrawerProps {
  isOpen: boolean;
  title: string;
  inquiries: any[];
  orgSlug: string;
  onClose: () => void;
}

export function DrilldownDrawer({
  isOpen,
  title,
  inquiries,
  orgSlug,
  onClose,
}: DrilldownDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
      <div className="flex h-full w-full max-w-xl flex-col border-l border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white">{title}</h2>
            <p className="text-xs text-slate-400">
              Showing {inquiries.length} underlying records
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/80 py-4">
          {inquiries.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No matching records found.
            </div>
          ) : (
            inquiries.map((inq) => (
              <div key={inq.id} className="py-3 hover:bg-slate-800/20 px-2 rounded-lg transition">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-white">
                    {inq.contactName || "Patient"}
                  </div>
                  <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[11px] font-semibold uppercase text-indigo-300">
                    {inq.status?.replace(/_/g, " ")}
                  </span>
                </div>

                <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
                  <span>Channel: <strong className="text-slate-300 capitalize">{inq.source?.replace(/_/g, " ")}</strong></span>
                  {inq.contactPhone && (
                    <span>Phone: <strong className="text-slate-300">{inq.contactPhone}</strong></span>
                  )}
                </div>

                {inq.notes && (
                  <p className="mt-1 text-xs text-slate-400 line-clamp-2">
                    {inq.notes}
                  </p>
                )}

                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    Created {new Date(inq.created_at).toLocaleDateString("en-ZA")}
                  </span>
                  <Link
                    href={`/${orgSlug}/contacts/${inq.contact_id}`}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                  >
                    View Contact Timeline →
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-slate-800 pt-3 text-right">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700"
          >
            Close Drilldown
          </button>
        </div>
      </div>
    </div>
  );
}
