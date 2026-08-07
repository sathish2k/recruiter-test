import { DEFAULT_ROLE_PERMISSIONS } from "@recruit/types";

/**
 * Every resource an `access` rule may name. A typo here is invisible at
 * runtime — `canAccess` denies any resource absent from the user's map and the
 * element is then stripped without warning — so this union is the guard.
 */
export type Resource =
  | "dashboard"
  | "workspace"
  | "reports"
  | "members"
  | "roles"
  | "clients"
  | "contacts"
  | "jobs"
  | "candidates"
  | "submissions"
  | "interviews"
  | "ai"
  | "templates"
  | "integrations"
  | "billing"
  | "security"
  | "audit"
  | "revenue"
  | "commissions"
  | "settings";

export const ROLE_PERMISSIONS = DEFAULT_ROLE_PERMISSIONS;
