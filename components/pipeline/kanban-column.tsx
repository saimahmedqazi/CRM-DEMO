"use client";

import { KanbanCard } from "./kanban-card";

interface KanbanColumnProps {
  id: string;
  name: string;
  color: string;
  inquiries: any[];
  onMoveStage: (inquiryId: string, currentStatus: string) => void;
  onSelectInquiry: (inquiry: any) => void;
}

export function KanbanColumn({
  id,
  name,
  color,
  inquiries,
  onMoveStage,
  onSelectInquiry,
}: KanbanColumnProps) {
  return (
    <div className="w-80 shrink-0 flex flex-col bg-muted/20 border border-border rounded-xl max-h-[calc(100vh-12rem)] shadow-2xs">
      {/* Column Header */}
      <div className="p-3.5 border-b border-border flex items-center justify-between select-none">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
          <h3 className="font-bold text-xs uppercase tracking-wider text-foreground">{name}</h3>
        </div>
        <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full border border-border/80">
          {inquiries.length}
        </span>
      </div>

      {/* Cards Scroll Container */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {inquiries.length === 0 ? (
          <div className="h-32 flex items-center justify-center border-2 border-dashed border-border/60 rounded-xl text-center p-4">
            <span className="text-xs text-muted-foreground italic">No inquiries in this stage</span>
          </div>
        ) : (
          inquiries.map((inq) => (
            <KanbanCard
              key={inq.id}
              inquiry={inq}
              onMoveStage={onMoveStage}
              onClick={() => onSelectInquiry(inq)}
            />
          ))
        )}
      </div>
    </div>
  );
}
