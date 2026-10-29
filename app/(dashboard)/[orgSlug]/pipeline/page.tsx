"use client";

import { useParams } from "next/navigation";
import { KanbanBoard } from "@/components/pipeline/kanban-board";
import { leadService } from "@/lib/services/lead-service";

export default function PipelinePage() {
  const params = useParams();
  const orgSlug = (params?.orgSlug as string) || "hoffman-audiology";

  const { inquiries } = leadService.getInquiries({
    orgId: "hoffman-audiology",
    pageSize: 100,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Interactive Pipeline Kanban</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Track patient journey stages from initial inquiry to confirmed appointment and outcome.
        </p>
      </div>

      <KanbanBoard initialInquiries={inquiries} orgSlug={orgSlug} />
    </div>
  );
}
