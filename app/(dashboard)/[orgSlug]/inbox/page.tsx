"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Plus, Download, Upload, Users, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InboxFilters } from "@/components/lead-inbox/inbox-filters";
import { InboxTable } from "@/components/lead-inbox/inbox-table";
import { LeadDetailDrawer } from "@/components/lead-inbox/lead-detail-drawer";
import { CreateLeadDialog } from "@/components/lead-inbox/create-lead-dialog";
import { MergeLeadsDialog } from "@/components/lead-inbox/merge-leads-dialog";
import { CSVImportDialog } from "@/components/lead-inbox/csv-import-dialog";
import { CSVExportButton } from "@/components/lead-inbox/csv-export-button";
import { leadService } from "@/lib/services/lead-service";

export default function LeadInboxPage() {
  const params = useParams();
  const orgSlug = (params?.orgSlug as string) || "hoffman-audiology";

  const [search, setSearch] = useState("");
  const [source, setSource] = useState("all");
  const [status, setStatus] = useState("all");
  const [locationId, setLocationId] = useState("all");

  const [inquiries, setInquiries] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedInquiry, setSelectedInquiry] = useState<any | null>(null);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [mergeDialogOpen, setMergeDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  const fetchLeads = () => {
    const res = leadService.getInquiries({
      orgId: "hoffman-audiology",
      search,
      source,
      status,
      locationId,
      page: 1,
      pageSize: 50,
    });
    setInquiries(res.inquiries);
    setTotalCount(res.totalCount);
  };

  useEffect(() => {
    fetchLeads();
  }, [search, source, status, locationId]);

  const handleResetFilters = () => {
    setSearch("");
    setSource("all");
    setStatus("all");
    setLocationId("all");
  };

  return (
    <div className="space-y-6">
      {/* Page Header with Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <span>Unified Lead Inbox</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {totalCount} Active
            </span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time multi-channel inquiry queue for Hoffman Audiology Inc. (Durban & Ballito)
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setMergeDialogOpen(true)} className="gap-1.5 text-xs">
            <Users className="h-3.5 w-3.5" />
            <span>Merge Duplicates</span>
          </Button>

          <Button variant="outline" size="sm" onClick={() => setImportDialogOpen(true)} className="gap-1.5 text-xs">
            <Upload className="h-3.5 w-3.5" />
            <span>Import CSV</span>
          </Button>

          <CSVExportButton inquiries={inquiries} filename={`hoffman-audiology-leads-${new Date().toISOString().split("T")[0]}.csv`} />

          <Button size="sm" onClick={() => setCreateDialogOpen(true)} className="gap-1.5 text-xs font-semibold shadow-xs">
            <Plus className="h-3.5 w-3.5" />
            <span>New Lead</span>
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <InboxFilters
        search={search}
        onSearchChange={setSearch}
        source={source}
        onSourceChange={setSource}
        status={status}
        onStatusChange={setStatus}
        locationId={locationId}
        onLocationChange={setLocationId}
        onReset={handleResetFilters}
      />

      {/* TanStack Lead Table */}
      <InboxTable
        inquiries={inquiries}
        onSelectInquiry={(inq) => setSelectedInquiry(inq)}
      />

      {/* Detail Slide-Over Drawer */}
      <LeadDetailDrawer
        inquiry={selectedInquiry}
        orgSlug={orgSlug}
        onClose={() => setSelectedInquiry(null)}
        onUpdated={fetchLeads}
      />

      {/* Manual Creation Dialog */}
      <CreateLeadDialog
        isOpen={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onLeadCreated={fetchLeads}
      />

      {/* Merge Leads Dialog */}
      <MergeLeadsDialog
        isOpen={mergeDialogOpen}
        inquiries={inquiries}
        onClose={() => setMergeDialogOpen(false)}
        onMerged={fetchLeads}
      />

      {/* CSV Import Dialog */}
      <CSVImportDialog
        isOpen={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        onImportComplete={fetchLeads}
      />
    </div>
  );
}
