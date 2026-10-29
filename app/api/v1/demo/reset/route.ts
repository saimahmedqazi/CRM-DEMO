import { NextResponse } from "next/server";
import { persistentDemoStore } from "@/lib/db/persistent-demo-store";

export async function POST() {
  const seed = persistentDemoStore.resetToDefault();

  const totalRevCents = seed.appointments.reduce((sum, a) => sum + (a.revenue_cents || 0), 0);

  return NextResponse.json({
    success: true,
    message: "Demo database successfully reset to clean Hoffman Audiology synthetic seed state.",
    summary: {
      contactsCreated: seed.contacts.length,
      inquiriesCreated: seed.inquiries.length,
      appointmentsCreated: seed.appointments.length,
      tasksCreated: seed.tasks.length,
      totalRevenueZar: totalRevCents / 100,
    },
  });
}
