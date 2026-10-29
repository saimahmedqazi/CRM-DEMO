"use client";

import { useState } from "react";
import { Users, UserPlus, Shield, Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "manager" | "agent" | "read_only";
  location: string;
  is_active: boolean;
}

const INITIAL_TEAM: TeamMember[] = [
  {
    id: "mem-1",
    name: "Dr. Kara Hoffman",
    email: "dr.hoffman@hoffmanaudiology.co.za",
    role: "owner",
    location: "Durban & Ballito",
    is_active: true,
  },
  {
    id: "mem-2",
    name: "Lindiwe Dlamini",
    email: "lindiwe@hoffmanaudiology.co.za",
    role: "manager",
    location: "Durban (Musgrave)",
    is_active: true,
  },
  {
    id: "mem-3",
    name: "Ashley Naidoo",
    email: "ashley@hoffmanaudiology.co.za",
    role: "agent",
    location: "Ballito (The Well)",
    is_active: true,
  },
  {
    id: "mem-4",
    name: "Thabo Cele",
    email: "thabo@hoffmanaudiology.co.za",
    role: "agent",
    location: "Durban (Musgrave)",
    is_active: true,
  },
];

export default function TeamSettingsPage() {
  const [members] = useState<TeamMember[]>(INITIAL_TEAM);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Team & Role-Based Access</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage practice staff, roles (Owner, Administrator, Manager, Agent, Read-only), and location assignments.
          </p>
        </div>
        <Button size="sm" onClick={() => setInviteModalOpen(true)} className="gap-2">
          <UserPlus className="h-4 w-4" />
          <span>Invite Staff Member</span>
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="py-3 px-4">Staff Member</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Assigned Location</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {members.map((member) => (
              <tr key={member.id} className="hover:bg-muted/20">
                <td className="py-3 px-4">
                  <div className="font-semibold text-foreground">{member.name}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Mail className="h-3 w-3" />
                    <span>{member.email}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                    <Shield className="h-3 w-3" />
                    <span className="capitalize">{member.role}</span>
                  </span>
                </td>
                <td className="py-3 px-4 text-xs text-foreground font-medium">
                  {member.location}
                </td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Active</span>
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <Button variant="ghost" size="sm" className="text-xs">
                    Edit
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {inviteModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-foreground">Invite Team Member</h3>
            <p className="text-xs text-muted-foreground">
              Send an invitation link to add an audiologist, receptionist, or practice manager.
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="colleague@hoffmanaudiology.co.za"
                  className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm text-foreground"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Assigned Role</label>
                <select className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm text-foreground">
                  <option value="agent">Agent (Handle Inquiries & Appointments)</option>
                  <option value="manager">Manager (Queue & Analytics Access)</option>
                  <option value="admin">Administrator (Full Practice Configuration)</option>
                  <option value="read_only">Read-Only (View Only)</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setInviteModalOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={() => setInviteModalOpen(false)}>
                Send Invitation
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
