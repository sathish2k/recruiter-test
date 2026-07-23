import { DEFAULT_ROLE_PERMISSIONS } from "@recruit/types";

export type Resource =
  | "dashboard"
  | "clients"
  | "contacts"
  | "jobs"
  | "candidates"
  | "interviews"
  | "commissions"
  | "audit"
  | "settings";

export const ROLE_PERMISSIONS = DEFAULT_ROLE_PERMISSIONS;
