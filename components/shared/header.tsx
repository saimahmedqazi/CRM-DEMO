"use client";

import { Bell, Search, MapPin, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  userEmail?: string;
  role?: string;
  locationName?: string;
}

export function Header({
  userEmail = "dr.hoffman@hoffmanaudiology.co.za",
  role = "Owner",
  locationName = "All Clinics (Durban & Ballito)",
}: HeaderProps) {
  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 select-none">
      {/* Search / Context */}
      <div className="flex items-center gap-4 w-96">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search leads, phone, email, notes..."
            className="w-full h-9 pl-9 pr-4 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
          />
        </div>
      </div>

      {/* Right Controls: Location indicator, notifications, user profile */}
      <div className="flex items-center gap-4">
        {/* Active Location Indicator */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-xs font-medium border border-border">
          <MapPin className="h-3.5 w-3.5 text-primary" />
          <span>{locationName}</span>
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive" />
        </Button>

        {/* User Badge */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-border">
          <div className="h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-semibold text-xs">
            KH
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-medium text-foreground leading-none">Dr. Kara Hoffman</p>
            <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
              <UserCheck className="h-3 w-3 text-primary" />
              <span>{role}</span>
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
