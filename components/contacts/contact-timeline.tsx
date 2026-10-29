"use client";

import {
  FileText,
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  AlertCircle,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
} from "lucide-react";
import { type ActivityRecord } from "@/lib/services/lead-service";

interface ContactTimelineProps {
  activities: ActivityRecord[];
}

export function ContactTimeline({ activities }: ContactTimelineProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "inquiry_created":
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case "call_logged":
        return <Phone className="h-4 w-4 text-purple-500" />;
      case "email_sent":
      case "email_received":
        return <Mail className="h-4 w-4 text-amber-500" />;
      case "whatsapp_sent":
      case "whatsapp_received":
        return <MessageSquare className="h-4 w-4 text-emerald-500" />;
      case "appointment_scheduled":
      case "appointment_outcome":
        return <Calendar className="h-4 w-4 text-teal-500" />;
      case "lead_merged":
        return <Users className="h-4 w-4 text-indigo-500" />;
      case "status_changed":
        return <ArrowRight className="h-4 w-4 text-orange-500" />;
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  if (activities.length === 0) {
    return (
      <div className="p-8 text-center border border-dashed border-border rounded-xl">
        <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-xs text-muted-foreground">No historical interactions recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
      {activities.map((act) => (
        <div key={act.id} className="relative flex items-start gap-4 text-xs group">
          {/* Circle Icon Badge */}
          <div className="absolute -left-6 top-0.5 h-6 w-6 rounded-full bg-card border border-border flex items-center justify-center shadow-xs">
            {getActivityIcon(act.activity_type)}
          </div>

          {/* Activity Content Box */}
          <div className="flex-1 p-3.5 rounded-lg border border-border bg-card shadow-xs space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="font-semibold text-foreground text-xs">{act.title}</span>
              <span className="font-mono text-[11px]">
                {new Date(act.created_at).toLocaleString("en-ZA", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            {act.description && (
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{act.description}</p>
            )}

            <div className="pt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
              <span>Recorded by:</span>
              <span className="text-primary">{act.staff_name}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
