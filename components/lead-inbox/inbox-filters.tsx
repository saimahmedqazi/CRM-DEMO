"use client";

import { Search, Filter, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InboxFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  source: string;
  onSourceChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  locationId: string;
  onLocationChange: (value: string) => void;
  onReset: () => void;
}

export function InboxFilters({
  search,
  onSearchChange,
  source,
  onSourceChange,
  status,
  onStatusChange,
  locationId,
  onLocationChange,
  onReset,
}: InboxFiltersProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-wrap items-center gap-3">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[240px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Filter by patient name, phone, email, notes..."
          className="w-full h-9 pl-9 pr-3 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      {/* Source Filter */}
      <div className="w-40">
        <select
          value={source}
          onChange={(e) => onSourceChange(e.target.value)}
          className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="all">All Channels</option>
          <option value="phone">Phone Calls</option>
          <option value="website">Website Forms</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="meta_ads">Meta Ads (FB/IG)</option>
          <option value="email">Direct Email</option>
          <option value="walk_in">Walk-in</option>
          <option value="referral">Physician Referral</option>
        </select>
      </div>

      {/* Status Filter */}
      <div className="w-44">
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="all">All Stages</option>
          <option value="new">New Inquiry</option>
          <option value="contacted">Contacted</option>
          <option value="follow_up_needed">Follow-up Needed</option>
          <option value="appointment_booked">Appointment Booked</option>
          <option value="completed">Completed</option>
          <option value="waiting_response">Waiting for Response</option>
          <option value="not_booked">Not Booked</option>
          <option value="lost">Lost</option>
        </select>
      </div>

      {/* Location Filter */}
      <div className="w-44">
        <select
          value={locationId}
          onChange={(e) => onLocationChange(e.target.value)}
          className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="all">All Clinics</option>
          <option value="loc-durban">Durban (Musgrave)</option>
          <option value="loc-ballito">Ballito (The Well)</option>
        </select>
      </div>

      {/* Reset Button */}
      <Button variant="ghost" size="sm" onClick={onReset} className="h-9 gap-1 text-xs text-muted-foreground">
        <RotateCcw className="h-3.5 w-3.5" />
        <span>Reset</span>
      </Button>
    </div>
  );
}
