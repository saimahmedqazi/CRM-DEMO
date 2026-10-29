"use client";

import { useState } from "react";
import { Building, Save, Palette, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GeneralSettingsPage() {
  const [orgName, setOrgName] = useState("Hoffman Audiology Inc.");
  const [timezone, setTimezone] = useState("Africa/Johannesburg (SAST, UTC+2)");
  const [currency, setCurrency] = useState("ZAR (R)");
  const [primaryColor, setPrimaryColor] = useState("#2563eb");
  const [tagline, setTagline] = useState("Advanced Audiological Care & Hearing Solutions");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Workspace Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure branding, timezone, currency, and multi-tenant preferences for Hoffman Audiology Inc.
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="border-b border-border pb-5">
            <h2 className="text-base font-semibold flex items-center gap-2 text-foreground">
              <Building className="h-4 w-4 text-primary" />
              <span>Practice Profile</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Public practice identity visible to team members and on external booking forms.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">
                  Organization Legal Name
                </label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">
                  Practice Tagline
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>
          </div>

          <div className="border-b border-border pb-5">
            <h2 className="text-base font-semibold flex items-center gap-2 text-foreground">
              <Globe className="h-4 w-4 text-primary" />
              <span>Localization & Timezone</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Governs appointment scheduling, SLA response calculation, and currency presentation.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">
                  Default Timezone
                </label>
                <input
                  type="text"
                  disabled
                  value={timezone}
                  className="w-full h-9 px-3 rounded-md border border-input bg-muted/50 text-sm text-foreground cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">
                  Currency
                </label>
                <input
                  type="text"
                  disabled
                  value={currency}
                  className="w-full h-9 px-3 rounded-md border border-input bg-muted/50 text-sm text-foreground cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-base font-semibold flex items-center gap-2 text-foreground">
              <Palette className="h-4 w-4 text-primary" />
              <span>White-label Branding</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Primary color accents applied across the CRM UI and embeddable customer intake forms.
            </p>

            <div className="flex items-center gap-4 mt-4">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="h-10 w-16 p-1 rounded-md border border-input bg-background cursor-pointer"
              />
              <span className="text-xs font-mono bg-muted px-2.5 py-1.5 rounded border border-border">
                {primaryColor}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <span className="text-xs text-emerald-600 font-medium">
              {saved && "✓ Workspace settings saved successfully"}
            </span>
            <Button type="submit" size="sm" className="gap-2">
              <Save className="h-4 w-4" />
              <span>Save Changes</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
