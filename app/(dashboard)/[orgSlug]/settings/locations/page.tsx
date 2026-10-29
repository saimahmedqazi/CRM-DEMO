"use client";

import { useState } from "react";
import { MapPin, Clock, Plus, CheckCircle2, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Location {
  id: string;
  name: string;
  slug: string;
  address: string;
  phone: string;
  email: string;
  is_active: boolean;
  business_hours: Record<string, { open: string; close: string; closed: boolean }>;
}

const INITIAL_LOCATIONS: Location[] = [
  {
    id: "loc-durban",
    name: "Durban Clinic (Musgrave)",
    slug: "durban",
    address: "Suite 402, Musgrave Park Medical Centre, 18 Musgrave Rd, Berea, Durban, 4001",
    phone: "+27 31 201 4589",
    email: "durban@hoffmanaudiology.co.za",
    is_active: true,
    business_hours: {
      Monday: { open: "08:00", close: "16:30", closed: false },
      Tuesday: { open: "08:00", close: "16:30", closed: false },
      Wednesday: { open: "08:00", close: "16:30", closed: false },
      Thursday: { open: "08:00", close: "16:30", closed: false },
      Friday: { open: "08:00", close: "16:30", closed: false },
      Saturday: { open: "08:30", close: "12:00", closed: false },
      Sunday: { open: "00:00", close: "00:00", closed: true },
    },
  },
  {
    id: "loc-ballito",
    name: "Ballito Clinic (The Well)",
    slug: "ballito",
    address: "Shop 12B, The Well Medical & Lifestyle Centre, Kirsty Rd, Ballito, 4420",
    phone: "+27 32 946 1120",
    email: "ballito@hoffmanaudiology.co.za",
    is_active: true,
    business_hours: {
      Monday: { open: "08:30", close: "16:30", closed: false },
      Tuesday: { open: "08:30", close: "16:30", closed: false },
      Wednesday: { open: "08:30", close: "16:30", closed: false },
      Thursday: { open: "08:30", close: "16:30", closed: false },
      Friday: { open: "08:30", close: "16:00", closed: false },
      Saturday: { open: "08:30", close: "12:00", closed: false },
      Sunday: { open: "00:00", close: "00:00", closed: true },
    },
  },
];

export default function LocationsSettingsPage() {
  const [locations, setLocations] = useState<Location[]>(INITIAL_LOCATIONS);
  const [selectedLocId, setSelectedLocId] = useState<string>("loc-durban");

  const selectedLoc = locations.find((l) => l.id === selectedLocId) || locations[0];

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Practice Locations & Clinics</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage multi-site clinics, addresses, phone lines, and operating hours governing follow-up SLAs.
          </p>
        </div>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          <span>Add New Location</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Locations List */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Active Clinics ({locations.length})
          </h2>
          {locations.map((loc) => {
            const isSelected = loc.id === selectedLocId;
            return (
              <div
                key={loc.id}
                onClick={() => setSelectedLocId(loc.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? "bg-primary/5 border-primary shadow-sm"
                    : "bg-card border-border hover:border-muted-foreground/30"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary shrink-0" />
                    <h3 className="text-sm font-semibold text-foreground">{loc.name}</h3>
                  </div>
                  {loc.is_active && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="h-3 w-3" /> Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{loc.address}</p>
                <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3" /> {loc.phone}
                  </span>
                  <span className="text-[11px] font-mono bg-muted px-1.5 py-0.5 rounded">SAST</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Location Details & Business Hours */}
        <div className="md:col-span-2 bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
          <div className="border-b border-border pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">{selectedLoc.name}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{selectedLoc.address}</p>
            </div>
            <span className="text-xs font-mono bg-secondary text-secondary-foreground px-2.5 py-1 rounded">
              Slug: {selectedLoc.slug}
            </span>
          </div>

          <div>
            <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground mb-3">
              <Clock className="h-4 w-4 text-primary" />
              <span>Weekly Business Hours (South Africa Standard Time)</span>
            </h3>
            <div className="space-y-2 border border-border rounded-lg p-3 bg-muted/20">
              {Object.entries(selectedLoc.business_hours).map(([day, hours]) => (
                <div
                  key={day}
                  className="flex items-center justify-between py-1.5 px-3 rounded hover:bg-muted/40 text-xs"
                >
                  <span className="font-medium text-foreground w-28">{day}</span>
                  {hours.closed ? (
                    <span className="text-muted-foreground italic">Closed</span>
                  ) : (
                    <span className="font-mono text-foreground font-medium">
                      {hours.open} — {hours.close}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-4 grid grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-muted-foreground font-medium mb-1">Direct Clinic Phone</label>
              <div className="flex items-center gap-2 p-2 rounded border border-input bg-muted/30">
                <Phone className="h-3.5 w-3.5 text-primary" />
                <span className="font-mono">{selectedLoc.phone}</span>
              </div>
            </div>
            <div>
              <label className="block text-muted-foreground font-medium mb-1">Inquiry Notification Email</label>
              <div className="flex items-center gap-2 p-2 rounded border border-input bg-muted/30">
                <Mail className="h-3.5 w-3.5 text-primary" />
                <span className="truncate">{selectedLoc.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
