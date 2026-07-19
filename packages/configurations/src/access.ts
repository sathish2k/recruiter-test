import { DEFAULT_ROLE_PERMISSIONS } from "@recruit/types";

export type Resource =
  | "dashboard"
  | "clients"
  | "jobs"
  | "candidates"
  | "interviews"
  | "commissions"
  | "audit"
  | "settings";

/** Offline fallback for the engine's `accessResolver` when the permissions API
 * is unreachable. The runtime source of truth is the DB (per agency); see
 * `DEFAULT_ROLE_PERMISSIONS` in `@recruit/types`. */
export const ROLE_PERMISSIONS = DEFAULT_ROLE_PERMISSIONS;
