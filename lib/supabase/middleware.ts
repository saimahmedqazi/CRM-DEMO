import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";

export type CookieToSet = {
  name: string;
  value: string;
  options?: CookieOptions;
};

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const isEmbedRoute = request.nextUrl.pathname.startsWith("/embed/");
  const isPublicApiRoute = request.nextUrl.pathname.startsWith("/api/v1/public/");
  const isWebhookRoute = request.nextUrl.pathname.startsWith("/api/v1/webhooks/");
  const isAuthRoute =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/register") ||
    request.nextUrl.pathname.startsWith("/auth");
  const isApiRoute =
    request.nextUrl.pathname.startsWith("/api") ||
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname === "/favicon.ico";

  // Public embed forms and public endpoints are completely unauthenticated
  if (isEmbedRoute || isPublicApiRoute || isWebhookRoute) {
    return supabaseResponse;
  }

  // Check demo session cookie for standalone sales demonstration mode
  const demoCookie = request.cookies.get("kuro_demo_session")?.value;
  const isDemoAuthenticated = demoCookie === "org-hoffman-01" || demoCookie === "demo-authenticated";

  // Check Supabase authentication
  let user = null;
  try {
    const supabase = createServerClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet: CookieToSet[]) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            supabaseResponse = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    // If Supabase is unavailable in local/demo preview, rely on demo session check
    user = null;
  }

  const isAuthenticated = !!user || isDemoAuthenticated;

  // Redirect unauthenticated users trying to access protected workspace routes
  if (!isAuthenticated && !isAuthRoute && !isApiRoute && request.nextUrl.pathname !== "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
