"use client";

import Papa from "papaparse";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CSVExportButtonProps {
  inquiries: any[];
  filename?: string;
}

export function CSVExportButton({ inquiries, filename = "crm-leads-export.csv" }: CSVExportButtonProps) {
  const handleExport = () => {
    const exportRows = inquiries.map((inq) => ({
      "Contact Name": inq.contactName,
      "Phone": inq.contactPhone || "",
      "Email": inq.contactEmail || "",
      "Channel": inq.source,
      "Clinic": inq.location_id === "loc-ballito" ? "Ballito" : "Durban",
      "Status": inq.status,
      "Priority": inq.priority,
      "Loss Reason": inq.loss_reason || "",
      "Notes": inq.notes || "",
      "Captured Date": new Date(inq.created_at).toISOString(),
    }));

    const csvString = Papa.unparse(exportRows);
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5 text-xs">
      <Download className="h-3.5 w-3.5" />
      <span>Export CSV</span>
    </Button>
  );
}
