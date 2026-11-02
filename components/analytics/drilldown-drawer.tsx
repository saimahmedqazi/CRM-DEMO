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
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
      <div className="flex h-full w-full max-w-xl flex-col border-l border-border bg-card p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">{title}</h2>
            <p className="text-xs text-muted-foreground">
              Showing {inquiries.length} underlying records
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-border py-4">
          {inquiries.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No matching records found.
            </div>
          ) : (
            inquiries.map((inq) => (
              <div key={inq.id} className="py-3 hover:bg-muted/30 px-2 rounded-lg transition-colors">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-foreground">
                    {inq.contactName || "Patient"}
                  </div>
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase text-primary">
                    {inq.status?.replace(/_/g, " ")}
                  </span>
                </div>

                <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>Channel: <strong className="text-foreground capitalize">{inq.source?.replace(/_/g, " ")}</strong></span>
                  {inq.contactPhone && (
                    <span>Phone: <strong className="text-foreground">{inq.contactPhone}</strong></span>
                  )}
                </div>

                {inq.notes && (
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                    {inq.notes}
                  </p>
                )}

                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">
                    Created {new Date(inq.created_at).toLocaleDateString("en-ZA")}
                  </span>
                  <Link
                    href={`/${orgSlug}/contacts/${inq.contact_id}`}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    View Contact Timeline →
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-border pt-3 text-right">
          <button
            onClick={onClose}
            className="rounded-lg border border-input bg-background px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
          >
            Close Drilldown
          </button>
        </div>
      </div>
    </div>
  );
}
