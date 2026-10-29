import { describe, it, expect } from "vitest";
import { hasPermission, requirePermission, UnauthorizedError } from "@/lib/auth/rbac";

describe("RBAC Permissions", () => {
  it("allows owner to perform all administrative and operational actions", () => {
    expect(hasPermission("owner", "org:delete")).toBe(true);
    expect(hasPermission("owner", "org:settings")).toBe(true);
    expect(hasPermission("owner", "leads:delete")).toBe(true);
    expect(hasPermission("owner", "team:invite")).toBe(true);
  });

  it("allows admin to configure settings and manage team but not delete organization", () => {
    expect(hasPermission("admin", "org:settings")).toBe(true);
    expect(hasPermission("admin", "team:invite")).toBe(true);
    expect(hasPermission("admin", "org:delete")).toBe(false);
  });

  it("restricts manager from changing org settings or deleting organization", () => {
    expect(hasPermission("manager", "leads:merge")).toBe(true);
    expect(hasPermission("manager", "analytics:view")).toBe(true);
    expect(hasPermission("manager", "org:settings")).toBe(false);
    expect(hasPermission("manager", "team:manage")).toBe(false);
  });

  it("allows agent to manage leads and tasks but not export or view full analytics", () => {
    expect(hasPermission("agent", "leads:read")).toBe(true);
    expect(hasPermission("agent", "leads:create")).toBe(true);
    expect(hasPermission("agent", "tasks:create")).toBe(true);
    expect(hasPermission("agent", "leads:export")).toBe(false);
    expect(hasPermission("agent", "analytics:view")).toBe(false);
  });

  it("allows read_only to only view leads and tasks", () => {
    expect(hasPermission("read_only", "leads:read")).toBe(true);
    expect(hasPermission("read_only", "tasks:read")).toBe(true);
    expect(hasPermission("read_only", "leads:create")).toBe(false);
    expect(hasPermission("read_only", "tasks:create")).toBe(false);
  });

  it("requirePermission throws UnauthorizedError when permission is lacking", () => {
    expect(() => requirePermission("read_only", "leads:create")).toThrowError(UnauthorizedError);
    expect(() => requirePermission("admin", "leads:create")).not.toThrow();
  });
});
