"use client";

import { useState } from "react";
import { UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { leadService, type InquirySource, type InquiryPriority } from "@/lib/services/lead-service";

interface CreateLeadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadCreated: () => void;
}

export function CreateLeadDialog({ isOpen, onClose, onLeadCreated }: CreateLeadDialogProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [locationId, setLocationId] = useState("loc-durban");
  const [source, setSource] = useState<InquirySource>("phone");
  const [priority, setPriority] = useState<InquiryPriority>("medium");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      leadService.createLead({
        organizationId: "hoffman-audiology",
        firstName,
        lastName,
        phone,
        email,
        locationId,
        source,
        priority,
        notes,
        staffName: "Dr. Kara Hoffman",
      });

      onLeadCreated();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl p-6 max-w-lg w-full shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-base font-bold flex items-center gap-2 text-foreground">
            <UserPlus className="h-4 w-4 text-primary" />
            <span>Manually Create Lead / Inquiry</span>
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">First Name *</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Sipho"
                className="w-full h-9 px-3 rounded-md border border-input bg-background text-xs text-foreground"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Khumalo"
                className="w-full h-9 px-3 rounded-md border border-input bg-background text-xs text-foreground"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Phone Number (SA)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="082 123 4567"
                className="w-full h-9 px-3 rounded-md border border-input bg-background text-xs text-foreground font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="patient@example.com"
                className="w-full h-9 px-3 rounded-md border border-input bg-background text-xs text-foreground"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Clinic Location</label>
              <select
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                className="w-full h-9 px-2 rounded-md border border-input bg-background text-xs text-foreground"
              >
                <option value="loc-durban">Durban (Musgrave)</option>
                <option value="loc-ballito">Ballito (The Well)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Inquiry Channel</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as InquirySource)}
                className="w-full h-9 px-2 rounded-md border border-input bg-background text-xs text-foreground"
              >
                <option value="phone">Phone Call</option>
                <option value="walk_in">Walk-in</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="website">Website</option>
                <option value="email">Email</option>
                <option value="referral">Doctor Referral</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as InquiryPriority)}
                className="w-full h-9 px-2 rounded-md border border-input bg-background text-xs text-foreground"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">Initial Inquiry / Concern</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Reason for inquiry (e.g. general hearing test, hearing aid trial, wax removal)..."
              className="w-full p-2.5 rounded-md border border-input bg-background text-xs text-foreground"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button size="sm" type="submit" disabled={loading}>
              {loading ? "Saving..." : "Create Lead"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
