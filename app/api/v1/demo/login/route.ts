import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Authenticated to Hoffman Audiology Sales Demonstration Workspace",
    redirectTo: "/hoffman-audiology/inbox",
  });

  // Set demo session cookie (expires in 7 days)
  response.cookies.set("kuro_demo_session", "org-hoffman-01", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60,
  });

  return response;
}
