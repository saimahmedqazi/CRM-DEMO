"use client";

import { useState } from "react";
import { KanbanColumn } from "./kanban-column";
import { StageConfigModal } from "./stage-config-modal";
import { LeadDetailDrawer } from "@/components/lead-inbox/lead-detail-drawer";
import { Settings2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { leadService, type InquiryStatus } from "@/lib/services/lead-service";

interface KanbanBoardProps {
  initialInquiries: any[];
  orgSlug: string;
}

const DEFAULT_STAGES = [
  { id: "new", name: "New Inquiry", color: "#3b82f6" },
  { id: "contacted", name: "Contacted", color: "#8b5cf6" },
  { id: "follow_up_needed", name: "Follow-up Needed", color: "#f59e0b" },
  { id: "appointment_booked", name: "Appointment Booked", color: "#10b981" },
  { id: "completed", name: "Completed", color: "#059669", is_terminal: true },
];

export function KanbanBoard({ initialInquiries, orgSlug }: KanbanBoardProps) {
  const [stages, setStages] = useState(DEFAULT_STAGES);
  const [inquiries, setInquiries] = useState(initialInquiries);
  const [selectedInquiry, setSelectedInquiry] = useState<any | null>(null);
  const [configModalOpen, setConfigModalOpen] = useState(false);

  const reloadData = async () => {
    try {
      const res = await fetch("/api/v1/leads?orgId=org-hoffman-01&pageSize=100");
      if (res.ok) {
        const data = await res.json();
        setInquiries(data.inquiries);
        return;
      }
    } catch {
      // Fallback
    }
    const res = leadService.getInquiries({ orgId: "org-hoffman-01", pageSize: 100 });
    setInquiries(res.inquiries);
  };

  const handleAdvanceStage = async (inquiryId: string, currentStatus: string) => {
    const stageFlow: Record<string, InquiryStatus> = {
      new: "contacted",
      contacted: "follow_up_needed",
      follow_up_needed: "appointment_booked",
      appointment_booked: "completed",
    };

    const nextStatus = stageFlow[currentStatus];
    if (nextStatus) {
      try {
        await fetch("/api/v1/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "update_status",
            inquiryId,
            newStatus: nextStatus,
            staffName: "Dr. Kara Hoffman",
          }),
        });
      } catch {
        leadService.updateInquiryStatus("org-hoffman-01", inquiryId, nextStatus, undefined, "Dr. Kara Hoffman");
      }
      reloadData();
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground font-medium">
            Showing {inquiries.length} inquiries across {stages.length} workflow stages
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setConfigModalOpen(true)}
          className="gap-1.5 text-xs"
        >
          <Settings2 className="h-3.5 w-3.5" />
          <span>Customize Stages</span>
        </Button>
      </div>

      {/* Horizontal Kanban Columns Container */}
      <div className="flex items-start gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => {
          const stageInquiries = inquiries.filter((inq) => inq.status === stage.id);
          return (
            <KanbanColumn
              key={stage.id}
              id={stage.id}
              name={stage.name}
              color={stage.color}
              inquiries={stageInquiries}
              onMoveStage={handleAdvanceStage}
              onSelectInquiry={(inq) => setSelectedInquiry(inq)}
            />
          );
        })}
      </div>

      {/* Lead Detail Drawer */}
      <LeadDetailDrawer
        inquiry={selectedInquiry}
        orgSlug={orgSlug}
        onClose={() => setSelectedInquiry(null)}
        onUpdated={reloadData}
      />

      {/* Stage Configuration Modal */}
      <StageConfigModal
        isOpen={configModalOpen}
        stages={stages}
        onClose={() => setConfigModalOpen(false)}
        onSaveStages={setStages}
      />
    </div>
  );
}
