import { Sidebar } from "@/components/shared/sidebar";
import { Header } from "@/components/shared/header";
import { Sparkles, ShieldCheck } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  params: Promise<{ orgSlug: string }>;
}

export default async function DashboardLayout({
  children,
  params,
}: DashboardLayoutProps) {
  const resolvedParams = await params;
  const orgSlug = resolvedParams.orgSlug || "hoffman-audiology";

  return (
    <div className="flex h-screen overflow-hidden bg-background flex-col">
      {/* Top Demo Disclosure Banner */}
      <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-1.5 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200 shrink-0">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-950 dark:text-amber-100 font-bold text-[10px] uppercase tracking-wider">
            <Sparkles className="h-3 w-3" />
            <span>Sales Demonstration</span>
          </span>
          <span className="font-medium text-xs">
            Hoffman Audiology Workspace • 100% Synthetic Demo Records • Simulated Integrations
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-amber-800/80 dark:text-amber-300/80 hidden sm:flex">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>No live patient PHI or production trunks connected</span>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <Sidebar orgSlug={orgSlug} orgName="Hoffman Audiology Inc. (Demo)" />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Header
            userEmail="demo.kara@kurosolutions.co.za"
            role="Practice Owner"
            locationName="Durban & Ballito"
          />
          <main className="flex-1 overflow-y-auto p-6 bg-muted/10">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
