"use client";

import { useState } from "react";
import Link from "next/link";
import {
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Send,
  UserCheck,
  FileText,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { type InquiryRecord, type InquiryStatus, leadService } from "@/lib/services/lead-service";
import { AIAssistantWidget } from "@/components/lead-inbox/ai-assistant-widget";

interface EnrichedInquiry extends InquiryRecord {
  contactName: string;
  contactEmail: string | null;
  contactPhone: string | null;
}

interface LeadDetailDrawerProps {
  inquiry: EnrichedInquiry | null;
  orgSlug: string;
  onClose: () => void;
  onUpdated: () => void;
}

export function LeadDetailDrawer({ inquiry, orgSlug, onClose, onUpdated }: LeadDetailDrawerProps) {
  const [noteText, setNoteText] = useState("");
  const [status, setStatus] = useState<InquiryStatus>(inquiry?.status || "new");
  const [lossReason, setLossReason] = useState("");
  const [showLossModal, setShowLossModal] = useState(false);

  if (!inquiry) return null;

  const handleStatusChange = (newStatus: InquiryStatus) => {
    if (newStatus === "lost") {
      setShowLossModal(true);
      return;
    }
    setStatus(newStatus);
    leadService.updateInquiryStatus("hoffman-audiology", inquiry.id, newStatus, undefined, "Dr. Kara Hoffman");
    onUpdated();
  };

  const confirmLost = () => {
    setStatus("lost");
    leadService.updateInquiryStatus("hoffman-audiology", inquiry.id, "lost", lossReason, "Dr. Kara Hoffman");
    setShowLossModal(false);
    onUpdated();
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    leadService.addActivityNote("hoffman-audiology", inquiry.contact_id, noteText.trim(), "Dr. Kara Hoffman");
    setNoteText("");
    onUpdated();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-lg bg-card border-l border-border h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-6 border-b border-border flex items-start justify-between bg-muted/20">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-foreground">{inquiry.contactName}</h2>
              <Link
                href={`/${orgSlug}/contacts/${inquiry.contact_id}`}
                className="text-primary hover:underline text-xs flex items-center gap-0.5"
              >
                <span>View Full Record</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Captured {new Date(inquiry.created_at).toLocaleString("en-ZA")}</span>
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status Quick Select */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Inquiry Pipeline Stage
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {(
                [
                  ["new", "New Inquiry"],
                  ["contacted", "Contacted"],
                  ["follow_up_needed", "Follow-up Needed"],
                  ["appointment_booked", "Booked"],
                  ["completed", "Completed"],
                  ["waiting_response", "Waiting Response"],
                  ["lost", "Mark Lost"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleStatusChange(key)}
                  className={`p-2 rounded-md font-medium border text-left transition-colors ${
                    status === key
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-muted/40 border-border hover:bg-muted text-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Contact Details Card */}
          <div className="p-4 rounded-xl border border-border bg-muted/10 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-medium">Phone Number</span>
              <span className="font-mono font-semibold text-foreground">{inquiry.contactPhone || "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-medium">Email Address</span>
              <span className="font-medium text-foreground">{inquiry.contactEmail || "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-medium">Channel / Source</span>
              <span className="capitalize font-semibold text-primary">{inquiry.source.replace("_", " ")}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-medium">Assigned Clinic</span>
              <span className="font-medium text-foreground">
                {inquiry.location_id === "loc-ballito" ? "Ballito (The Well)" : "Durban (Musgrave)"}
              </span>
            </div>
          </div>

          {/* Original Patient Note */}
          {inquiry.notes && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Inquiry Message / Request
              </h3>
              <div className="p-3 rounded-lg border border-border bg-card text-xs text-foreground leading-relaxed">
                {inquiry.notes}
              </div>
            </div>
          )}

          {/* AI Clinical Assistant Widget (POPIA Safe) */}
          <AIAssistantWidget
            patientName={inquiry.contactName}
            patientPhone={inquiry.contactPhone}
            patientEmail={inquiry.contactEmail}
            source={inquiry.source}
            notes={inquiry.notes}
            clinicLocation={inquiry.location_id?.includes("blt") ? "Ballito Clinic" : "Durban Clinic"}
          />

          {/* Quick Staff Note Entry */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              <span>Add Staff Note / Interaction</span>
            </h3>
            <form onSubmit={handleAddNote} className="space-y-2">
              <textarea
                rows={3}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Log phone call conversation, WhatsApp update, or clinical consideration..."
                className="w-full p-2.5 rounded-md border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <div className="flex justify-end">
                <Button type="submit" size="sm" className="h-8 text-xs gap-1.5">
                  <Send className="h-3 w-3" />
                  <span>Log Note</span>
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Close
          </Button>
          <Link href={`/${orgSlug}/appointments`}>
            <Button size="sm" className="text-xs gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span>Schedule Appointment</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Documented Loss Reason Modal */}
      {showLossModal && (
        <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-rose-600 font-bold">
              <AlertTriangle className="h-5 w-5" />
              <h3>Record Loss Reason</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Please specify why this inquiry could not be converted to a booked appointment.
            </p>
            <select
              value={lossReason}
              onChange={(e) => setLossReason(e.target.value)}
              className="w-full h-9 px-3 rounded-md border border-input bg-background text-xs text-foreground"
            >
              <option value="">Select documented loss reason...</option>
              <option value="Price objection / Hearing aid cost">Price objection / Hearing aid cost</option>
              <option value="Out of catchment area / Distance">Out of catchment area / Distance</option>
              <option value="Purchased from competitor / Hospital">Purchased from competitor / Hospital</option>
              <option value="Unresponsive after 3+ follow-up attempts">Unresponsive after 3+ follow-up attempts</option>
              <option value="Symptoms temporarily resolved">Symptoms temporarily resolved</option>
              <option value="Medical aid / Insurance declined benefit">Medical aid / Insurance declined benefit</option>
            </select>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowLossModal(false)}>
                Cancel
              </Button>
              <Button size="sm" variant="destructive" onClick={confirmLost} disabled={!lossReason}>
                Confirm Lost
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
