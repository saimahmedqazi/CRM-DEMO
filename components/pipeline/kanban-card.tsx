"use client";

import { Phone, Globe, MessageSquare, Facebook, Mail, Clock, AlertTriangle, ChevronRight, User } from "lucide-react";

interface KanbanCardProps {
  inquiry: {
    id: string;
    contactName: string;
    contactPhone: string | null;
    contactEmail: string | null;
    source: string;
    status: string;
    priority: string;
    location_id: string | null;
    notes: string | null;
    created_at: string;
    last_interaction_at: string;
  };
  onMoveStage: (inquiryId: string, currentStatus: string) => void;
  onClick: () => void;
}

export function KanbanCard({ inquiry, onMoveStage, onClick }: KanbanCardProps) {
  const getSourceIcon = (source: string) => {
    switch (source) {
      case "phone":
        return <Phone className="h-3 w-3 text-blue-500" />;
      case "whatsapp":
        return <MessageSquare className="h-3 w-3 text-emerald-500" />;
      case "website":
        return <Globe className="h-3 w-3 text-indigo-500" />;
      case "meta_ads":
        return <Facebook className="h-3 w-3 text-sky-600" />;
      case "email":
        return <Mail className="h-3 w-3 text-amber-500" />;
      default:
        return <User className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const hoursSinceInteraction =
    (new Date().getTime() - new Date(inquiry.last_interaction_at).getTime()) / (1000 * 60 * 60);

  const isStalled =
    hoursSinceInteraction > 48 && !["completed", "lost", "appointment_booked"].includes(inquiry.status);

  return (
    <div
      onClick={onClick}
      className="p-3.5 bg-card border border-border rounded-xl shadow-xs hover:border-primary/50 hover:shadow-sm cursor-pointer transition-all space-y-2.5 text-xs select-none"
    >
      {/* Top Header: Channel, Location, Priority */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-medium text-foreground capitalize">
          {getSourceIcon(inquiry.source)}
          <span>{inquiry.source.replace("_", " ")}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {inquiry.location_id === "loc-ballito" ? (
            <span className="text-[10px] font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 px-1.5 py-0.5 rounded">
              Ballito
            </span>
          ) : (
            <span className="text-[10px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded">
              Durban
            </span>
          )}
          {inquiry.priority === "urgent" && (
            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
              Urgent
            </span>
          )}
        </div>
      </div>

      {/* Patient Name & Contact Details */}
      <div>
        <h4 className="font-bold text-sm text-foreground">{inquiry.contactName}</h4>
        <p className="text-muted-foreground font-mono text-[11px] mt-0.5">
          {inquiry.contactPhone || inquiry.contactEmail || "No contact info"}
        </p>
      </div>

      {/* Note Preview */}
      {inquiry.notes && (
        <p className="text-muted-foreground line-clamp-2 text-[11px] bg-muted/30 p-2 rounded border border-border/50">
          {inquiry.notes}
        </p>
      )}

      {/* Uncertainty Indicator: Highlights stalled leads without prematurely marking as Lost */}
      {isStalled && (
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded border border-amber-200 dark:border-amber-800/40">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          <span>Stalled &gt;48h — Follow-up Needed</span>
        </div>
      )}

      {/* Bottom Footer: Time in Stage + Advance Button */}
      <div className="flex items-center justify-between pt-2 border-t border-border/50 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>{Math.round(hoursSinceInteraction)}h ago</span>
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onMoveStage(inquiry.id, inquiry.status);
          }}
          className="text-primary hover:underline font-semibold flex items-center gap-0.5 text-xs"
        >
          <span>Advance</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
