"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Search,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Clock,
  ArrowRight,
  Filter,
  ShieldCheck,
  Tag,
  Building2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getClinicName, getClinicShortName, isBallito, isDurban } from "@/lib/utils";

interface ContactItem {
  id: string;
  organization_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  phone_normalized: string | null;
  preferred_location_id: string | null;
  custom_fields: Record<string, any>;
  tags: string[];
  inquiryCount: number;
  appointmentCount: number;
  latestActivity?: {
    id: string;
    title: string;
    staff_name: string;
    created_at: string;
    activity_type: string;
  } | null;
  activeInquiry?: {
    id: string;
    status: string;
    source: string;
    notes: string | null;
  } | null;
  created_at: string;
  updated_at: string;
}

export default function ContactsDirectoryPage() {
  const params = useParams();
  const orgSlug = (params?.orgSlug as string) || "hoffman-audiology";

  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/contacts?orgId=org-hoffman-01`);
      if (res.ok) {
        const data = await res.json();
        setContacts(data.contacts || []);
      }
    } catch (err) {
      console.error("Failed to fetch contacts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      // Clinic location filter
      if (locationFilter === "ballito" && !isBallito(c.preferred_location_id)) {
        return false;
      }
      if (locationFilter === "durban" && !isDurban(c.preferred_location_id)) {
        return false;
      }

      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const fullName = `${c.first_name} ${c.last_name}`.toLowerCase();
        const matchesName = fullName.includes(q);
        const matchesPhone = c.phone?.toLowerCase().includes(q) || false;
        const matchesEmail = c.email?.toLowerCase().includes(q) || false;
        const matchesTag = c.tags?.some((t) => t.toLowerCase().includes(q)) || false;
        return matchesName || matchesPhone || matchesEmail || matchesTag;
      }

      return true;
    });
  }, [contacts, locationFilter, search]);

  // Statistics
  const totalContacts = contacts.length;
  const durbanCount = contacts.filter((c) => isDurban(c.preferred_location_id)).length;
  const ballitoCount = contacts.filter((c) => isBallito(c.preferred_location_id)).length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            <span>Patient & Contact Directory</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Centralized directory of all patient records, inquiry audit trails, and communication history
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs gap-1 py-1 px-2.5 font-normal">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>POPIA Audited</span>
          </Badge>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Total Patients
            </span>
            <Users className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-black text-foreground mt-2 font-mono">
            {totalContacts}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Active patient records</p>
        </div>

        <div className="p-4 rounded-xl border border-sky-200 dark:border-sky-950/60 bg-sky-50/50 dark:bg-sky-950/20 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300">
              Durban Clinic
            </span>
            <Building2 className="h-4 w-4 text-sky-600" />
          </div>
          <div className="text-2xl font-black text-sky-800 dark:text-sky-200 mt-2 font-mono">
            {durbanCount}
          </div>
          <p className="text-[11px] text-sky-600 dark:text-sky-400 mt-1">Musgrave Road Practice</p>
        </div>

        <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-950/60 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
              Ballito Clinic
            </span>
            <MapPin className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-800 dark:text-emerald-200 mt-2 font-mono">
            {ballitoCount}
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">The Well Medical Centre</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, email, or tag..."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Filter className="h-3 w-3" /> Clinic:
          </span>
          <div className="inline-flex rounded-lg border border-border p-0.5 bg-muted/40">
            <button
              type="button"
              onClick={() => setLocationFilter("all")}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                locationFilter === "all"
                  ? "bg-card text-foreground font-semibold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All Clinics
            </button>
            <button
              type="button"
              onClick={() => setLocationFilter("durban")}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                locationFilter === "durban"
                  ? "bg-card text-foreground font-semibold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Durban
            </button>
            <button
              type="button"
              onClick={() => setLocationFilter("ballito")}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                locationFilter === "ballito"
                  ? "bg-card text-foreground font-semibold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Ballito
            </button>
          </div>
        </div>
      </div>

      {/* Contacts List */}
      <div className="bg-card border border-border rounded-xl shadow-sm divide-y divide-border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            Loading patient records...
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <p className="text-sm font-semibold text-foreground">No patient records found</p>
            <p className="text-xs text-muted-foreground">
              Try adjusting your search criteria or clinic filter.
            </p>
          </div>
        ) : (
          filteredContacts.map((contact) => {
            const clinicName = getClinicShortName(contact.preferred_location_id);
            const isBlt = isBallito(contact.preferred_location_id);

            return (
              <div
                key={contact.id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/30 transition-colors"
              >
                {/* Left: Avatar & Info */}
                <div className="flex items-start sm:items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                    {contact.first_name[0] || "P"}
                    {contact.last_name[0] || ""}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/${orgSlug}/contacts/${contact.id}`}
                        className="text-sm font-bold text-foreground hover:text-primary transition-colors hover:underline"
                      >
                        {contact.first_name} {contact.last_name}
                      </Link>

                      <Badge
                        variant="secondary"
                        className={`text-[10px] font-semibold px-2 py-0.5 ${
                          isBlt
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
                            : "bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200 dark:border-sky-800/60"
                        }`}
                      >
                        {clinicName}
                      </Badge>

                      {contact.tags?.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded font-mono"
                        >
                          <Tag className="h-2.5 w-2.5" />
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 font-mono">
                        <Phone className="h-3 w-3 text-primary" />
                        {contact.phone || "No phone"}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3 text-primary" />
                        {contact.email || "No email"}
                      </span>
                      {contact.latestActivity && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            Latest: {contact.latestActivity.title} (
                            {new Date(contact.latestActivity.created_at).toLocaleDateString("en-ZA")})
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <Link href={`/${orgSlug}/appointments`}>
                    <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                      <Calendar className="h-3 w-3" />
                      <span>Book</span>
                    </Button>
                  </Link>

                  <Link href={`/${orgSlug}/contacts/${contact.id}`}>
                    <Button size="sm" className="h-8 text-xs gap-1.5">
                      <span>View Record</span>
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
