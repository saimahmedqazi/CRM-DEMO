import { describe, it, expect } from "vitest";
import { env } from "@/lib/env";

describe("Environment Variables", () => {
  it("loads validated environment with defaults", () => {
    expect(env).toBeDefined();
    expect(env.NEXT_PUBLIC_SUPABASE_URL).toBeDefined();
    expect(env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBeDefined();
    expect(env.APP_URL).toBe("http://localhost:3000");
  });
});
