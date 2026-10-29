import { NextRequest, NextResponse } from "next/server";
import { analyticsService } from "@/lib/services/analytics-service";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const orgId = url.searchParams.get("orgId") || "org-hoffman-01";
  const locationId = url.searchParams.get("locationId") || undefined;
  const dateRange = (url.searchParams.get("dateRange") as "7d" | "30d" | "90d" | "all") || "all";

  const metrics = await analyticsService.getExecutiveDashboardMetrics(orgId, {
    locationId: locationId && locationId !== "all" ? locationId : undefined,
    dateRange,
  });

  return NextResponse.json(metrics);
}
