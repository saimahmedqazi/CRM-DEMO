import React from "react";
import { EmbeddableForm } from "@/components/integrations/embeddable-form";

interface EmbedPageProps {
  params: Promise<{
    orgSlug: string;
  }>;
}

export default async function EmbedPage({ params }: EmbedPageProps) {
  const resolvedParams = await params;
  const orgSlug = resolvedParams.orgSlug;

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6">
      <EmbeddableForm
        orgSlug={orgSlug}
        practiceName="Hoffman Audiology Inc."
      />
    </main>
  );
}
