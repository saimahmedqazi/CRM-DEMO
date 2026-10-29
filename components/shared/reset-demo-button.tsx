"use client";

import { useState } from "react";
import { RotateCcw, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ResetDemoButton() {
  const [resetting, setResetting] = useState(false);
  const [done, setDone] = useState(false);

  const handleReset = async () => {
    const confirm = window.confirm(
      "Reset demo workspace to default synthetic seed data? This will restore all sample inquiries, tasks, and appointments to their pristine demonstration baseline."
    );
    if (!confirm) return;

    setResetting(true);
    try {
      const res = await fetch("/api/v1/demo/reset", { method: "POST" });
      if (res.ok) {
        setDone(true);
        setTimeout(() => {
          window.location.reload();
        }, 600);
      }
    } catch (e) {
      console.error("Failed to reset demo data", e);
    } finally {
      setResetting(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleReset}
      disabled={resetting}
      className="h-7 px-2.5 text-[11px] font-semibold gap-1.5 border-amber-500/40 text-amber-900 dark:text-amber-200 hover:bg-amber-500/20 bg-amber-500/10"
      title="Reset demo records to initial pristine seed state"
    >
      {done ? (
        <>
          <Check className="h-3 w-3 text-emerald-600" />
          <span>Reset Complete</span>
        </>
      ) : (
        <>
          <RotateCcw className={`h-3 w-3 ${resetting ? "animate-spin" : ""}`} />
          <span>{resetting ? "Resetting..." : "Reset Demo Data"}</span>
        </>
      )}
    </Button>
  );
}
