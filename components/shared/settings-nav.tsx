"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { Building, MapPin, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export function SettingsNav() {
  const pathname = usePathname();
  const params = useParams();
  const orgSlug = (params?.orgSlug as string) || "hoffman-audiology";

  const tabs = [
    {
      name: "General Practice",
      href: `/${orgSlug}/settings/general`,
      icon: Building,
    },
    {
      name: "Clinic Locations",
      href: `/${orgSlug}/settings/locations`,
      icon: MapPin,
    },
    {
      name: "Team & POPIA Access",
      href: `/${orgSlug}/settings/team`,
      icon: Users,
    },
  ];

  return (
    <div className="flex items-center gap-1 border-b border-border pb-px mb-6">
      {tabs.map((tab) => {
        const isActive = pathname.startsWith(tab.href);
        const Icon = tab.icon;
        return (
          <Link
            key={tab.name}
            href={tab.href}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-all -mb-px",
              isActive
                ? "border-primary text-primary font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{tab.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
