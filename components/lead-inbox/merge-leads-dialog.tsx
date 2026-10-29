"use client";

import { useState } from "react";
import { Users, AlertTriangle, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { leadService } from "@/lib/services/lead-service";

interface MergeLeadsDialogProps {
  isOpen: boolean;
  inquiries: any[];
  onClose: () => void;
  onMerged: () => void;
}

export function MergeLeadsDialog({ isOpen, inquiries, onClose, onMerged }: MergeLeadsDialogProps) {
  const [primaryId, setPrimaryId] = useState<string>("");
  const [secondaryId, setSecondaryId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Filter distinct contacts
  const contacts = Array.from(
    new Map(inquiries.map((i) => [i.contact_id, { id: i.contact_id, name: i.contactName, phone: i.contactPhone, email: i.contactEmail }])).values()
  );

  const primaryContact = contacts.find((c) => c.id === primaryId);
  const secondaryContact = contacts.find((c) => c.id === secondaryId);

  const handleMerge = () => {
    if (!primaryId || !secondaryId || primaryId === secondaryId) return;
    setLoading(true);

    try {
      leadService.reparentRecordsOnMerge("hoffman-audiology", primaryId, secondaryId, "Dr. Kara Hoffman");
      onMerged();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl p-6 max-w-2xl w-full shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="text-base font-bold text-foreground">Merge Duplicate Contacts</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-lg text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
          <div>
            <p className="font-semibold">Preserves Complete Audit Trail</p>
            <p className="mt-0.5">
              Merging will re-point all inquiries, notes, appointments, and activities from the secondary contact to the primary contact. No historical data is destroyed.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Primary Selection */}
          <div className="p-4 rounded-lg border border-border bg-muted/20 space-y-3">
            <label className="block text-xs font-bold text-foreground uppercase tracking-wider">
              1. Keep Primary Contact
            </label>
            <select
              value={primaryId}
              onChange={(e) => setPrimaryId(e.target.value)}
              className="w-full h-9 px-3 rounded-md border border-input bg-background text-xs text-foreground"
            >
              <option value="">Select Primary Contact...</option>
              {contacts.map((c) => (
                <option key={c.id} value={c.id} disabled={c.id === secondaryId}>
                  {c.name} ({c.phone || c.email || "No details"})
                </option>
              ))}
            </select>

            {primaryContact && (
              <div className="p-3 bg-card rounded border border-border text-xs space-y-1">
                <p className="font-semibold text-foreground">{primaryContact.name}</p>
                <p className="text-muted-foreground">{primaryContact.phone}</p>
                <p className="text-muted-foreground">{primaryContact.email}</p>
              </div>
            )}
          </div>

          {/* Secondary Selection */}
          <div className="p-4 rounded-lg border border-border bg-muted/20 space-y-3">
            <label className="block text-xs font-bold text-foreground uppercase tracking-wider">
              2. Merge & Archive Secondary
            </label>
            <select
              value={secondaryId}
              onChange={(e) => setSecondaryId(e.target.value)}
              className="w-full h-9 px-3 rounded-md border border-input bg-background text-xs text-foreground"
            >
              <option value="">Select Secondary Contact...</option>
              {contacts.map((c) => (
                <option key={c.id} value={c.id} disabled={c.id === primaryId}>
                  {c.name} ({c.phone || c.email || "No details"})
                </option>
              ))}
            </select>

            {secondaryContact && (
              <div className="p-3 bg-card rounded border border-border text-xs space-y-1">
                <p className="font-semibold text-foreground">{secondaryContact.name}</p>
                <p className="text-muted-foreground">{secondaryContact.phone}</p>
                <p className="text-muted-foreground">{secondaryContact.email}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-border">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleMerge}
            disabled={!primaryId || !secondaryId || primaryId === secondaryId || loading}
            className="gap-2"
          >
            <span>{loading ? "Merging..." : "Confirm & Merge Contacts"}</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
