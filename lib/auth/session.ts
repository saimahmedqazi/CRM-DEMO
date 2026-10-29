import { createClient } from "@/lib/supabase/server";
import { type UserRole } from "./rbac";

export interface WorkspaceSession {
  user: {
    id: string;
    email: string;
  };
  organization: {
    id: string;
    name: string;
    slug: string;
    timezone: string;
    currency: string;
  };
  role: UserRole;
}

export async function getCurrentWorkspaceSession(orgSlug?: string): Promise<WorkspaceSession | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return null;
  }

  // If orgSlug is provided, find that specific organization and user's membership
  if (orgSlug) {
    const { data: orgData, error: orgError } = await supabase
      .from("organizations")
      .select("id, name, slug, timezone, currency, organization_members!inner(role)")
      .eq("slug", orgSlug)
      .single();

    if (orgError || !orgData) {
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const member = (orgData as any).organization_members?.[0];
    const role: UserRole = member?.role || "read_only";

    return {
      user: {
        id: user.id,
        email: user.email,
      },
      organization: {
        id: orgData.id,
        name: orgData.name,
        slug: orgData.slug,
        timezone: orgData.timezone,
        currency: orgData.currency,
      },
      role,
    };
  }

  // Otherwise, default to user's first available organization
  const { data: memberData } = await supabase
    .from("organization_members")
    .select("role, organizations!inner(id, name, slug, timezone, currency)")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!memberData) {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const org = (memberData as any).organizations;

  return {
    user: {
      id: user.id,
      email: user.email,
    },
    organization: {
      id: org.id,
      name: org.name,
      slug: org.slug,
      timezone: org.timezone,
      currency: org.currency,
    },
    role: memberData.role as UserRole,
  };
}
