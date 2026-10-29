"use client";

import { useState } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContactTimeline } from "@/components/contacts/contact-timeline";
import { leadService } from "@/lib/services/lead-service";

export default function ContactDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orgSlug = (params?.orgSlug as string) || "hoffman-audiology";
  const contactId = params?.contactId as string;

  const [noteText, setNoteText] = useState("");
  const [, setRefresh] = useState(0);

  const contactData = leadService.getContactWithTimeline("hoffman-audiology", contactId);

  if (!contactData) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-lg font-bold text-foreground">Contact Record Not Found</h2>
        <p className="text-xs text-muted-foreground">The requested patient or contact does not exist in this workspace.</p>
        <Link href={`/${orgSlug}/inbox`}>
          <Button size="sm" variant="outline">
            Return to Inbox
          </Button>
        </Link>
      </div>
    );
  }

  const { contact, inquiries, activities } = contactData;

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    leadService.addActivityNote("hoffman-audiology", contact.id, noteText.trim(), "Dr. Kara Hoffman");
    setNoteText("");
    setRefresh((prev) => prev + 1);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Back Button */}
      <div>
        <Link
          href={`/${orgSlug}/inbox`}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Lead Inbox</span>
        </Link>
      </div>

      {/* Contact Profile Header */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl">
            {contact.first_name[0]}
            {contact.last_name[0]}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {contact.first_name} {contact.last_name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
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
            <span className="text-xs text-muted-foreground">{activities.length} total events recorded</span>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <ContactTimeline activities={activities} />
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
                <Button type="submit" size="sm" className="h-8 text-xs gap-1.5">
                  <Send className="h-3 w-3" />
                  <span>Log Note</span>
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
              {inquiries.map((inq) => (
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
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
