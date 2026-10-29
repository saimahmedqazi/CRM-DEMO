import { Sidebar } from "@/components/shared/sidebar";
import { Header } from "@/components/shared/header";

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
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar orgSlug={orgSlug} orgName="Hoffman Audiology Inc." />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header
          userEmail="dr.hoffman@hoffmanaudiology.co.za"
          role="Practice Owner"
          locationName="Durban & Ballito"
        />
        <main className="flex-1 overflow-y-auto p-6 bg-muted/10">
          {children}
        </main>
      </div>
    </div>
  );
}
