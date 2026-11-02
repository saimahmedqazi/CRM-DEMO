"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Plus,
  Send,
  MessageSquare,
  FileText,
  ShieldCheck,
  Tag,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ContactTimeline } from "@/components/contacts/contact-timeline";
import { leadService } from "@/lib/services/lead-service";
import { getClinicShortName, isBallito } from "@/lib/utils";

interface ContactData {
  contact: {
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
    created_at: string;
    updated_at: string;
  };
  inquiries: Array<{
    id: string;
    source: string;
    status: string;
    priority: string;
    notes: string | null;
    created_at: string;
  }>;
  activities: Array<{
    id: string;
    activity_type: string;
    title: string;
    description: string | null;
    staff_name: string;
    created_at: string;
    metadata?: Record<string, any>;
  }>;
}

export default function ContactDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orgSlug = (params?.orgSlug as string) || "hoffman-audiology";
  const contactId = params?.contactId as string;

  const [contactData, setContactData] = useState<ContactData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submittingNote, setSubmittingNote] = useState(false);
  const [noteText, setNoteText] = useState("");

  const loadData = async () => {
    if (!contactId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/contacts/${contactId}?orgId=org-hoffman-01`);
      if (res.ok) {
        const json = await res.json();
        setContactData(json);
        return;
      }
    } catch (err) {
      console.warn("API fetch error, falling back to local service", err);
    }

    // Client/SSR fallback
    const fallback = leadService.getContactWithTimeline("org-hoffman-01", contactId);
    if (fallback) {
      setContactData(fallback as any);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData().finally(() => setLoading(false));
  }, [contactId]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim() || !contactData) return;

    try {
      setSubmittingNote(true);
      const res = await fetch(`/api/v1/contacts/${contactId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_note",
          orgId: "org-hoffman-01",
          noteText: noteText.trim(),
          staffName: "Dr. Kara Hoffman",
        }),
      });

      if (res.ok) {
        setNoteText("");
        await loadData();
      } else {
        // Fallback
        leadService.addActivityNote("org-hoffman-01", contactData.contact.id, noteText.trim(), "Dr. Kara Hoffman");
        setNoteText("");
        await loadData();
      }
    } catch {
      leadService.addActivityNote("org-hoffman-01", contactData.contact.id, noteText.trim(), "Dr. Kara Hoffman");
      setNoteText("");
      await loadData();
    } finally {
      setSubmittingNote(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-muted-foreground">
        Loading patient history & timeline...
      </div>
    );
  }

  if (!contactData) {
    return (
      <div className="p-8 text-center space-y-4 max-w-md mx-auto">
        <h2 className="text-lg font-bold text-foreground">Contact Record Not Found</h2>
        <p className="text-xs text-muted-foreground">
          The requested patient or contact does not exist in this workspace.
        </p>
        <div className="flex justify-center gap-2">
          <Link href={`/${orgSlug}/contacts`}>
            <Button size="sm" variant="outline">
              Return to Contacts
            </Button>
          </Link>
          <Link href={`/${orgSlug}/inbox`}>
            <Button size="sm">
              Go to Inbox
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const { contact, inquiries, activities } = contactData;
  const clinicName = getClinicShortName(contact.preferred_location_id);
  const isBlt = isBallito(contact.preferred_location_id);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Back Button */}
      <div className="flex items-center gap-4">
        <Link
          href={`/${orgSlug}/contacts`}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Contacts</span>
        </Link>
        <span className="text-muted-foreground/40">•</span>
        <Link
          href={`/${orgSlug}/inbox`}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <span>Lead Inbox</span>
        </Link>
      </div>

      {/* Contact Profile Header */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl shrink-0">
            {contact.first_name?.[0] || "P"}
            {contact.last_name?.[0] || ""}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">
                {contact.first_name} {contact.last_name}
              </h1>

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

            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1.5">
              <span className="flex items-center gap-1 font-mono">
                <Phone className="h-3.5 w-3.5 text-primary" />
                {contact.phone || "No phone"}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Mail className="h-3.5 w-3.5 text-primary" />
                {contact.email || "No email"}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                First seen: {new Date(contact.created_at).toLocaleDateString("en-ZA")}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/${orgSlug}/appointments`}>
            <Button size="sm" className="gap-1.5 text-xs">
              <Calendar className="h-3.5 w-3.5" />
              <span>Schedule Appointment</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Grid: Left Timeline / Right Inquiries & Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Chronological Audit Trail & Interaction Timeline */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground">Complete Interaction History</h2>
            <span className="text-xs text-muted-foreground font-mono">{activities.length} total events recorded</span>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <ContactTimeline activities={activities as any} />
          </div>
        </div>

        {/* Right Column: Inquiries Summary & Quick Log */}
        <div className="space-y-6">
          {/* Quick Note Input */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-primary" />
              <span>Log Staff Activity / Note</span>
            </h3>
            <form onSubmit={handleAddNote} className="space-y-2">
              <textarea
                rows={3}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Log call conversation, follow-up attempt, or patient update..."
                className="w-full p-2.5 rounded-md border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <div className="flex justify-end">
                <Button type="submit" size="sm" disabled={submittingNote || !noteText.trim()} className="h-8 text-xs gap-1.5">
                  <Send className="h-3 w-3" />
                  <span>{submittingNote ? "Logging..." : "Log Note"}</span>
                </Button>
              </div>
            </form>
          </div>

          {/* Linked Inquiries */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Linked Inquiries ({inquiries.length})
            </h3>
            <div className="space-y-2">
              {inquiries.length === 0 ? (
                <p className="text-xs text-muted-foreground">No linked inquiries found.</p>
              ) : (
                inquiries.map((inq) => (
                  <div key={inq.id} className="p-3 rounded-lg border border-border bg-muted/20 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground capitalize">{inq.source.replace("_", " ")}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary uppercase">
                        {inq.status}
                      </span>
                    </div>
                    <p className="text-muted-foreground line-clamp-2">{inq.notes || "No message provided."}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">
                      {new Date(inq.created_at).toLocaleString("en-ZA")}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
