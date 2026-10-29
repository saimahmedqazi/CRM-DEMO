"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Inbox,
  Kanban,
  CheckSquare,
  Calendar,
  Users,
  BarChart3,
  Zap,
  Plug,
  Settings,
  Building2,
  Stethoscope,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  orgSlug: string;
  orgName?: string;
}

export function Sidebar({ orgSlug, orgName = "Hoffman Audiology" }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { name: "Lead Inbox", href: `/${orgSlug}/inbox`, icon: Inbox },
    { name: "Pipeline", href: `/${orgSlug}/pipeline`, icon: Kanban },
    { name: "Action Queue", href: `/${orgSlug}/tasks`, icon: CheckSquare },
    { name: "Appointments", href: `/${orgSlug}/appointments`, icon: Calendar },
    { name: "Contacts", href: `/${orgSlug}/contacts`, icon: Users },
    { name: "Analytics", href: `/${orgSlug}/analytics`, icon: BarChart3 },
    { name: "Automations", href: `/${orgSlug}/automations`, icon: Zap },
    { name: "Integrations", href: `/${orgSlug}/integrations`, icon: Plug },
    { name: "Settings", href: `/${orgSlug}/settings/general`, icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col h-screen select-none">
      {/* Brand & Workspace Header */}
      <div className="h-16 border-b border-border flex items-center px-6 gap-3">
        <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
          <Stethoscope className="h-5 w-5" />
        </div>
        <div className="overflow-hidden">
          <h2 className="text-sm font-semibold truncate leading-tight text-foreground">
            {orgName}
          </h2>
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            Kuro Solutions CRM
          </span>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / Location Pill */}
      <div className="p-4 border-t border-border bg-muted/40">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
          <span className="truncate">Clinics: Durban & Ballito (SAST)</span>
        </div>
      </div>
    </aside>
  );
}
