export type UserRole = "owner" | "admin" | "manager" | "agent" | "read_only";

export type PermissionAction =
  | "org:delete"
  | "org:billing"
  | "org:settings"
  | "team:invite"
  | "team:manage"
  | "locations:manage"
  | "leads:read"
  | "leads:create"
  | "leads:update"
  | "leads:delete"
  | "leads:merge"
  | "leads:export"
  | "tasks:read"
  | "tasks:create"
  | "tasks:update"
  | "tasks:delete"
  | "appointments:read"
  | "appointments:manage"
  | "analytics:view"
  | "integrations:manage"
  | "automations:manage"
  | "ai:use";

const ROLE_PERMISSIONS: Record<UserRole, PermissionAction[]> = {
  owner: [
    "org:delete",
    "org:billing",
    "org:settings",
    "team:invite",
    "team:manage",
    "locations:manage",
    "leads:read",
    "leads:create",
    "leads:update",
    "leads:delete",
    "leads:merge",
    "leads:export",
    "tasks:read",
    "tasks:create",
    "tasks:update",
    "tasks:delete",
    "appointments:read",
    "appointments:manage",
    "analytics:view",
    "integrations:manage",
    "automations:manage",
    "ai:use",
  ],
  admin: [
    "org:billing",
    "org:settings",
    "team:invite",
    "team:manage",
    "locations:manage",
    "leads:read",
    "leads:create",
    "leads:update",
    "leads:delete",
    "leads:merge",
    "leads:export",
    "tasks:read",
    "tasks:create",
    "tasks:update",
    "tasks:delete",
    "appointments:read",
    "appointments:manage",
    "analytics:view",
    "integrations:manage",
    "automations:manage",
    "ai:use",
  ],
  manager: [
    "leads:read",
    "leads:create",
    "leads:update",
    "leads:merge",
    "leads:export",
    "tasks:read",
    "tasks:create",
    "tasks:update",
    "tasks:delete",
    "appointments:read",
    "appointments:manage",
    "analytics:view",
    "ai:use",
  ],
  agent: [
    "leads:read",
    "leads:create",
    "leads:update",
    "tasks:read",
    "tasks:create",
    "tasks:update",
    "appointments:read",
    "appointments:manage",
    "ai:use",
  ],
  read_only: [
    "leads:read",
    "tasks:read",
    "appointments:read",
  ],
};

export function hasPermission(role: UserRole, action: PermissionAction): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;
  return permissions.includes(action);
}

export class UnauthorizedError extends Error {
  constructor(message: string = "Unauthorized: Insufficient role permissions") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export function requirePermission(role: UserRole, action: PermissionAction): void {
  if (!hasPermission(role, action)) {
    throw new UnauthorizedError(`Role '${role}' is not permitted to perform '${action}'`);
  }
}
