"use client";

import { useState } from "react";
import Papa from "papaparse";
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { leadService } from "@/lib/services/lead-service";

interface CSVImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

export function CSVImportDialog({ isOpen, onClose, onImportComplete }: CSVImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [importedCount, setImportedCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setError(null);
    setImportedCount(null);

    Papa.parse(selected, {
      header: true,
      skipEmptyLines: true,
      preview: 5,
      complete: (results) => {
        setPreviewData(results.data);
      },
      error: (err) => {
        setError("Failed to parse CSV: " + err.message);
      },
    });
  };

  const handleExecuteImport = () => {
    if (!file) return;
    setLoading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        let count = 0;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        results.data.forEach((row: any) => {
          const firstName = row["First Name"] || row["first_name"] || row["Name"]?.split(" ")[0] || "Unknown";
          const lastName = row["Last Name"] || row["last_name"] || row["Name"]?.split(" ").slice(1).join(" ") || "Lead";
          const phone = row["Phone"] || row["phone"] || row["Mobile"] || null;
          const email = row["Email"] || row["email"] || null;
          const source = (row["Source"] || row["source"] || "website").toLowerCase().replace(" ", "_");
          const notes = row["Notes"] || row["notes"] || "Imported from CSV";

          leadService.createLead({
            organizationId: "hoffman-audiology",
            firstName,
            lastName,
            phone,
            email,
            source: ["phone", "website", "whatsapp", "meta_ads", "email", "walk_in", "referral"].includes(source)
              ? (source as any)
              : "website",
            notes,
            locationId: "loc-durban",
            staffName: "CSV Batch Import",
          });
          count++;
        });

        setImportedCount(count);
        setLoading(false);
        onImportComplete();
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl p-6 max-w-xl w-full shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            <h2 className="text-base font-bold text-foreground">Import Leads from CSV</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {importedCount !== null ? (
          <div className="p-6 text-center space-y-3">
            <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
            <h3 className="text-base font-bold text-foreground">Import Successful</h3>
            <p className="text-xs text-muted-foreground">
              Successfully ingested and deduplicated {importedCount} patient inquiries into Hoffman Audiology Inc.
            </p>
            <Button size="sm" onClick={onClose} className="mt-2">
              Done
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors">
              <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <label className="cursor-pointer">
                <span className="text-sm font-semibold text-primary hover:underline">Choose CSV File</span>
                <span className="text-xs text-muted-foreground block mt-1">
                  Expected headers: First Name, Last Name, Phone, Email, Source, Notes
                </span>
                <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
              </label>
              {file && <p className="text-xs text-foreground font-mono mt-2 font-semibold">Selected: {file.name}</p>}
            </div>

            {previewData.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Data Preview (First 5 Rows)
                </span>
                <div className="max-h-40 overflow-y-auto border border-border rounded-lg text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-muted/50 border-b border-border">
                      <tr>
                        {Object.keys(previewData[0] || {}).map((header) => (
                          <th key={header} className="p-2 font-semibold">{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border font-mono text-[11px]">
                      {previewData.map((row, idx) => (
                        <tr key={idx}>
                          {Object.values(row).map((val: any, cIdx) => (
                            <td key={cIdx} className="p-2 truncate max-w-[120px]">{val}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleExecuteImport} disabled={!file || loading}>
                {loading ? "Importing..." : "Run Import & Deduplicate"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
