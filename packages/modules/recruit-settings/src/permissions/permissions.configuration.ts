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

/** A titled block of permission rows. */
export interface PermissionGroup {
  /** Translation key for the uppercased group heading. */
  label: string;
  resources: string[];
}

/** One role card above the matrix. */
export interface RoleCard {
  value: string;
  /** Chip colours — the design gives each role its own triple. */
  fg: string;
  bg: string;
  border: string;
  /** True for the owner, which carries the "cannot be edited" note. */
  locked?: boolean;
}

export interface PermissionsConfig {
  /** Resource rows, in display order. */
  resources: string[];
  /** The same rows, split into the design's three sections. */
  groups: PermissionGroup[];
  /** Cards rendered above the matrix. */
  cards: RoleCard[];
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

const groups = [
  {
    label: "groups.recruiting",
    resources: [
      "linkedinInvites",
      "manageCvs",
      "aiScreening",
      "submitToClient",
      "scheduleInterviews",
      "exportCandidates",
      "deleteCandidates",
    ],
  },
  { label: "groups.jobsClients", resources: ["jobs", "clients", "dashboard"] },
  { label: "groups.workspace", resources: ["settings", "automation"] },
];

const resources = groups.flatMap((group) => group.resources);

const roles: PermissionRole[] = [
  { value: "admin", label: "roles.admin" },
  { value: "lead", label: "roles.lead" },
  { value: "employee", label: "roles.employee" },
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
  groups,
  cards: [
    {
      value: "admin",
      fg: "#F0B27C",
      bg: "rgba(242,106,27,.14)",
      border: "rgba(242,106,27,.35)",
      locked: true,
    },
    { value: "lead", fg: "#9BB8D9", bg: "rgba(90,130,180,.14)", border: "rgba(90,130,180,.35)" },
    {
      value: "employee",
      fg: "#8FD6AC",
      bg: "rgba(78,168,116,.14)",
      border: "rgba(78,168,116,.35)",
    },
  ],
  icons: {
    linkedinInvites: "person-add",
    manageCvs: "upload-file",
    aiScreening: "sparkle",
    submitToClient: "fact-check",
    scheduleInterviews: "call",
    exportCandidates: "download",
    deleteCandidates: "delete",
    jobs: "work",
    clients: "domain",
    dashboard: "insights",
    settings: "group-add",
    automation: "automation",
  },
  columns: ["admin", "lead", "employee"],
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
