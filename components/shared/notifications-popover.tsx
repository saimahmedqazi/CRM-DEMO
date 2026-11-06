"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Bell,
  Check,
  CheckCheck,
  Clock,
  PhoneCall,
  Calendar,
  MessageSquare,
  Zap,
  X,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface NotificationItem {
  id: string;
  type: "sla_alert" | "lead" | "appointment" | "automation";
  title: string;
  description: string;
  timestamp: string;
  link: string;
  read: boolean;
  clinic?: "Durban" | "Ballito" | "Both";
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    type: "sla_alert",
    title: "Urgent SLA Callback Overdue",
    description: "Sipho Cele (+27 82 000 0105) missed call to Durban Clinic requires immediate callback.",
    timestamp: "12m ago",
    link: "/tasks",
    read: false,
    clinic: "Durban",
  },
  {
    id: "notif-2",
    type: "lead",
    title: "New Online Patient Request",
    description: "Farzana Patel requested consultation for Lyric invisible hearing aid trial at Ballito.",
    timestamp: "45m ago",
    link: "/inbox",
    read: false,
    clinic: "Ballito",
  },
  {
    id: "notif-3",
    type: "appointment",
    title: "Hearing Assessment Scheduled",
    description: "Johan van der Merwe confirmed for Diagnostic Audiogram on Thursday 09:30 (SAST).",
    timestamp: "2h ago",
    link: "/appointments",
    read: false,
    clinic: "Durban",
  },
  {
    id: "notif-4",
    type: "automation",
    title: "Auto-Task Dispatched",
    description: "Rule 'Missed Call Follow-up SLA' triggered and queued task in Daily Action Queue.",
    timestamp: "3h ago",
    link: "/automations",
    read: true,
    clinic: "Both",
  },
];

export function NotificationsPopover() {
  const params = useParams();
  const router = useRouter();
  const orgSlug = (params?.orgSlug as string) || "hoffman-audiology";

  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const removeNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleNotificationClick = (notification: NotificationItem) => {
    markAsRead(notification.id);
    setIsOpen(false);
    router.push(`/${orgSlug}${notification.link}`);
  };

  const getNotificationIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "sla_alert":
        return (
          <div className="h-8 w-8 rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 flex items-center justify-center shrink-0">
            <PhoneCall className="h-4 w-4" />
          </div>
        );
      case "lead":
        return (
          <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <MessageSquare className="h-4 w-4" />
          </div>
        );
      case "appointment":
        return (
          <div className="h-8 w-8 rounded-full bg-sky-100 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400 flex items-center justify-center shrink-0">
            <Calendar className="h-4 w-4" />
          </div>
        );
      case "automation":
        return (
          <div className="h-8 w-8 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Zap className="h-4 w-4" />
          </div>
        );
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="View notifications"
        aria-expanded={isOpen}
        className={`relative h-9 w-9 transition-colors ${
          isOpen ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-xs animate-in zoom-in-50">
            {unreadCount}
          </span>
        )}
      </Button>

      {/* Popover Card */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-border bg-card shadow-2xl z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-3.5 border-b border-border flex items-center justify-between bg-muted/30">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-foreground">Notifications</span>
              {unreadCount > 0 ? (
                <span className="rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 px-2 py-0.5 text-[10px] font-bold">
                  {unreadCount} new
                </span>
              ) : (
                <span className="text-[11px] text-muted-foreground">All read</span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-primary hover:underline font-medium flex items-center gap-1 transition-colors"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-border">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground space-y-1">
                <p className="font-medium text-foreground">No notifications</p>
                <p>You&apos;re all caught up with clinic inquiries!</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-3.5 flex items-start gap-3 hover:bg-muted/40 cursor-pointer transition-colors relative group ${
                    !n.read ? "bg-muted/15" : ""
                  }`}
                >
                  {getNotificationIcon(n.type)}

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className={`text-xs font-semibold truncate ${!n.read ? "text-foreground font-bold" : "text-foreground/90"}`}>
                          {n.title}
                        </span>
                        {!n.read && (
                          <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        )}
                      </div>

                      <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                        {n.timestamp}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {n.description}
                    </p>

                    <div className="flex items-center justify-between pt-0.5">
                      {n.clinic && (
                        <span className="text-[10px] font-semibold text-primary/80 bg-primary/10 px-1.5 py-0.5 rounded">
                          {n.clinic}
                        </span>
                      )}

                      <span className="text-[10px] text-primary group-hover:underline flex items-center gap-0.5 ml-auto">
                        <span>View</span>
                        <ExternalLink className="h-2.5 w-2.5" />
                      </span>
                    </div>
                  </div>

                  {/* Dismiss button */}
                  <button
                    onClick={(e) => removeNotification(n.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-foreground rounded transition-opacity"
                    title="Dismiss"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 border-t border-border bg-muted/20 text-center">
            <Link
              href={`/${orgSlug}/tasks`}
              onClick={() => setIsOpen(false)}
              className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1"
            >
              <span>Go to Daily Action Queue</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
