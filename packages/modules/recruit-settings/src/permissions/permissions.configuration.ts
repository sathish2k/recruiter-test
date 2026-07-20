import type { AccessAction } from "@recruit/sdk";
import type { TableRendererConfig } from "@recruit/shared";

export interface PermissionRole {
  value: string;
  /** Translation key. */
  label: string;
}

export interface CrudAction {
  key: string;
  letter: string;
  /** Translation key. */
  label: string;
  /** Granular actions this CRUD group toggles as a unit. */
  actions: AccessAction[];
}

export interface PermissionsConfig {
  /** Resource rows, in display order. */
  resources: string[];
  /** Resource → IconRenderer registry key. */
  icons: Record<string, string>;
  /** Role columns, in display order (values from `roles`). */
  columns: string[];
  /** Columns rendered locked (dimmed, not editable — the "*" wildcard). */
  lockedColumns: string[];
  /** Role column display labels (translation keys). */
  roles: PermissionRole[];
  /** CRUD toggle set for a role × resource cell. */
  crudActions: CrudAction[];
  /** Matrix structure — resource column + one custom cell per role column. */
  table: TableRendererConfig;
}

const resources = ["dashboard", "clients", "jobs", "candidates", "interviews", "settings"];

const roles: PermissionRole[] = [
  { value: "admin", label: "roles.admin" },
  { value: "lead", label: "roles.lead" },
  { value: "employee", label: "roles.employee" },
  { value: "client", label: "roles.client" },
];

const table: TableRendererConfig = {
  columns: [
    {
      label: { name: "permission" },
      value: { type: "resource" },
    },
    ...roles.map((role) => ({
      label: { name: role.label },
      align: "center" as const,
      value: { type: `perm:${role.value}` },
    })),
  ],
};

export const PermissionsConfiguration: PermissionsConfig = {
  resources,
  icons: {
    dashboard: "dashboard",
    clients: "domain",
    jobs: "work",
    candidates: "group",
    interviews: "event",
    settings: "settings",
  },
  columns: ["admin", "lead", "employee", "client"],
  lockedColumns: ["admin"],
  roles,
  crudActions: [
    {
      key: "create",
      letter: "C",
      label: "actions.create",
      actions: ["create"],
    },
    { key: "read", letter: "R", label: "actions.read", actions: ["read"] },
    {
      key: "update",
      letter: "U",
      label: "actions.update",
      actions: ["edit", "update"],
    },
    {
      key: "delete",
      letter: "D",
      label: "actions.delete",
      actions: ["delete"],
    },
  ],
  table,
};
