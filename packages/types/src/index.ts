export type UserRole = "admin" | "lead" | "employee" | "client";

export interface User {
  id: string;
  agencyId: string;
  email: string;
  name: string;
  role: UserRole;
}

export type AccessAction = "read" | "create" | "edit" | "update" | "delete";

/** A role's permissions: resource → allowed actions ("*" = every resource). */
export type RolePermissions = Record<string, AccessAction[]>;

const ALL: AccessAction[] = ["read", "create", "edit", "update", "delete"];
const READ: AccessAction[] = ["read"];

/** Seed defaults for a new agency's role permissions. The DB is the runtime
 * source of truth (per agency, editable in Settings); this map is only the
 * initial seed and the offline fallback. Indexed by role string (may be a
 * legacy/unknown role, hence `Record<string, …>`). */
export const DEFAULT_ROLE_PERMISSIONS: Record<string, RolePermissions> = {
  admin: { "*": ALL },
  lead: {
    dashboard: READ,
    clients: ["read", "edit", "update"],
    jobs: ALL,
    candidates: ["read", "create", "edit", "update"],
    interviews: ALL,
    settings: READ,
  },
  employee: {
    dashboard: READ,
    jobs: READ,
    candidates: ["read", "create", "edit"],
    interviews: ["read", "create"],
  },
  client: {
    dashboard: READ,
    jobs: READ,
    candidates: READ,
  },
};
