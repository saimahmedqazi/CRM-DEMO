"use client";

import {
  Phone,
  Globe,
  MessageSquare,
  Facebook,
  Mail,
  User,
  Clock,
  AlertCircle,
  Calendar,
  ChevronRight,
} from "lucide-react";
import { type InquiryRecord } from "@/lib/services/lead-service";

interface EnrichedInquiry extends InquiryRecord {
  contactName: string;
  contactEmail: string | null;
  contactPhone: string | null;
}

interface InboxTableProps {
  inquiries: EnrichedInquiry[];
  onSelectInquiry: (inquiry: EnrichedInquiry) => void;
}

export function InboxTable({ inquiries, onSelectInquiry }: InboxTableProps) {
  const getSourceIcon = (source: string) => {
    switch (source) {
      case "phone":
        return <Phone className="h-3.5 w-3.5 text-blue-500" />;
      case "whatsapp":
        return <MessageSquare className="h-3.5 w-3.5 text-emerald-500" />;
      case "website":
        return <Globe className="h-3.5 w-3.5 text-indigo-500" />;
      case "meta_ads":
        return <Facebook className="h-3.5 w-3.5 text-sky-600" />;
      case "email":
        return <Mail className="h-3.5 w-3.5 text-amber-500" />;
      default:
        return <User className="h-3.5 w-3.5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">New Inquiry</span>;
      case "contacted":
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">Contacted</span>;
      case "follow_up_needed":
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">Follow-up Needed</span>;
      case "appointment_booked":
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">Booked</span>;
      case "completed":
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300">Completed</span>;
      case "waiting_response":
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300">Waiting on Patient</span>;
      case "not_booked":
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">Not Booked</span>;
      case "lost":
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">Lost</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">{status}</span>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">Urgent</span>;
      case "high":
        return <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">High</span>;
      case "medium":
        return <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded">Medium</span>;
      default:
        return <span className="text-[11px] text-muted-foreground">Low</span>;
    }
  };

  if (inquiries.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-12 text-center shadow-sm">
        <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <h3 className="text-base font-semibold text-foreground">No Inquiries Found</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
          No inquiries match your current search and filter criteria. Try resetting filters or creating a new lead.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 border-b border-border text-xs uppercase tracking-wider text-muted-foreground select-none">
            <tr>
              <th className="py-3 px-4">Contact / Patient</th>
              <th className="py-3 px-4">Channel</th>
              <th className="py-3 px-4">Clinic</th>
              <th className="py-3 px-4">Stage</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Last Activity</th>
              <th className="py-3 px-4 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {inquiries.map((inq) => (
              <tr
                key={inq.id}
                onClick={() => onSelectInquiry(inq)}
                className="hover:bg-muted/30 cursor-pointer transition-colors"
              >
                <td className="py-3.5 px-4">
                  <div className="font-semibold text-foreground">{inq.contactName}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5 font-mono">
                    {inq.contactPhone && <span>{inq.contactPhone}</span>}
                    {inq.contactEmail && <span>• {inq.contactEmail}</span>}
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-foreground capitalize">
                    {getSourceIcon(inq.source)}
                    <span>{inq.source.replace("_", " ")}</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-xs font-medium text-foreground">
                  {inq.location_id === "loc-ballito" ? "Ballito (The Well)" : "Durban (Musgrave)"}
                </td>
                <td className="py-3.5 px-4">{getStatusBadge(inq.status)}</td>
                <td className="py-3.5 px-4">{getPriorityBadge(inq.priority)}</td>
                <td className="py-3.5 px-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(inq.last_interaction_at || inq.created_at).toLocaleDateString("en-ZA", { month: "short", day: "numeric" })}</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <span className="p-1.5 rounded-md hover:bg-muted inline-flex items-center text-muted-foreground">
                    <ChevronRight className="h-4 w-4" />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
