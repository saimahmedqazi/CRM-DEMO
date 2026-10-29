"use client";

import { useState } from "react";
import { Settings2, X, Plus, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Stage {
  id: string;
  name: string;
  color: string;
  is_terminal?: boolean;
}

interface StageConfigModalProps {
  isOpen: boolean;
  stages: Stage[];
  onClose: () => void;
  onSaveStages: (stages: Stage[]) => void;
}

export function StageConfigModal({ isOpen, stages: initialStages, onClose, onSaveStages }: StageConfigModalProps) {
  const [stages, setStages] = useState<Stage[]>(initialStages);

  if (!isOpen) return null;

  const handleUpdateName = (index: number, newName: string) => {
    const updated = [...stages];
    updated[index].name = newName;
    setStages(updated);
  };

  const handleUpdateColor = (index: number, newColor: string) => {
    const updated = [...stages];
    updated[index].color = newColor;
    setStages(updated);
  };

  const handleSave = () => {
    onSaveStages(stages);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl p-6 max-w-lg w-full shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-primary" />
            <h2 className="text-base font-bold text-foreground">Customize Pipeline Stages</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Reorder or rename pipeline workflow stages to match your practice operations.
        </p>

        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {stages.map((stage, idx) => (
            <div key={stage.id} className="flex items-center gap-2 p-2 rounded-lg border border-border bg-muted/20">
              <input
                type="color"
                value={stage.color}
                onChange={(e) => handleUpdateColor(idx, e.target.value)}
                className="h-8 w-8 rounded border border-input cursor-pointer"
              />
              <input
                type="text"
                value={stage.name}
                onChange={(e) => handleUpdateName(idx, e.target.value)}
                className="flex-1 h-8 px-2.5 rounded border border-input bg-background text-xs text-foreground font-medium"
              />
              {stage.is_terminal && (
                <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded">
                  Terminal
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-border">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} className="gap-1.5">
            <Check className="h-4 w-4" />
            <span>Apply Changes</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
