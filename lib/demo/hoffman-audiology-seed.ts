import { persistentDemoStore } from "@/lib/db/persistent-demo-store";

export interface DemoWorkspaceDetails {
  organizationId: string;
  name: string;
  owner: string;
  locations: Array<{ id: string; name: string; city: string; phone: string }>;
  seedSummary: {
    contactsCreated: number;
    inquiriesCreated: number;
    appointmentsCreated: number;
    tasksCreated: number;
    totalRevenueZar: number;
  };
}

/**
 * Seeds or resets the Hoffman Audiology demonstration workspace with 100% synthetic data.
 * All phone numbers, emails, names, clinical notes, and values are fictional demonstration records.
 */
export async function seedHoffmanAudiologyDemo(): Promise<DemoWorkspaceDetails> {
  const orgId = "org-hoffman-01";
  const data = persistentDemoStore.resetToDefault();

  const totalRevCents = data.appointments.reduce((sum, a) => sum + (a.revenue_cents || 0), 0);

  return {
    organizationId: orgId,
    name: "Hoffman Audiology Inc. (Demonstration Workspace)",
    owner: "Dr. Kara Hoffman (M.Aud, Pr.No: 0820000-DEMO)",
    locations: [
      {
        id: "loc-dbn-01",
        name: "Durban Clinic (Musgrave) - Demonstration",
        city: "Durban, KwaZulu-Natal",
        phone: "+27 31 201 0001",
      },
      {
        id: "loc-blt-01",
        name: "Ballito Clinic (The Well) - Demonstration",
        city: "Ballito, KwaZulu-Natal",
        phone: "+27 32 946 0002",
      },
    ],
    seedSummary: {
      contactsCreated: data.contacts.length,
      inquiriesCreated: data.inquiries.length,
      appointmentsCreated: data.appointments.length,
      tasksCreated: data.tasks.length,
      totalRevenueZar: totalRevCents / 100,
    },
  };
}
