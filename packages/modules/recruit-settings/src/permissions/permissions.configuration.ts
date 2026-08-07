import type { AccessAction, AccessRule } from "@recruit/sdk";
import type { RecordScope } from "@recruit/types";

/** One column of the matrix. `actions` is what a tick writes to the store. */
export interface PermissionColumn {
  key: string;
  /** Translation key. */
  label: string;
  actions: AccessAction[];
  /** Columns that must be on for this one to mean anything. */
  requires: string[];
}

export interface PermissionRow {
  resource: string;
  /** IconRenderer registry key. */
  icon: string;
  /** Record-bearing, so the row carries a scope. */
  scoped: boolean;
}

export interface PermissionGroup {
  /** Translation key for the uppercased heading. */
  key: string;
  rows: PermissionRow[];
}

export interface PermissionsConfig {
  columns: PermissionColumn[];
  groups: PermissionGroup[];
  /** Record-scope values, in the order the row cycles through them. */
  scopes: RecordScope[];
  /** Role key → IconRenderer key for the role card's tile. */
  roleIcons: Record<string, string>;
  /** Roles rendered frozen — the owner holds everything by definition. */
  lockedRoles: string[];
  /** Editing the matrix. Without it the screen is read-only. */
  manageAccess: AccessRule;
  /** Minting or deleting a role — a separate authority from editing one. */
  createAccess: AccessRule;
  /** Where a deleted custom role's holders land. */
  reassignTo: string;
  /** Icon a role the agency invents gets. */
  customRoleIcon: string;
  /** "Open in user management" target. */
  membersLink: { routeId: string };
}

/**
 * The matrix. Rows are the `Resource` union minus the two that gate routes
 * (`settings`, `dashboard`) — those must stay out of the editable matrix, or
 * clearing a tick locks the role out of the screen holding the matrix.
 */
export const PermissionsConfiguration: PermissionsConfig = {
  columns: [
    { key: "view", label: "columns.view", actions: ["read", "view"], requires: [] },
    { key: "create", label: "columns.create", actions: ["create"], requires: ["view"] },
    { key: "edit", label: "columns.edit", actions: ["edit", "update"], requires: ["view"] },
    { key: "delete", label: "columns.delete", actions: ["delete"], requires: ["view", "edit"] },
    { key: "export", label: "columns.export", actions: ["export"], requires: ["view"] },
  ],
  groups: [
    {
      key: "groups.recruiting",
      rows: [
        { resource: "jobs", icon: "work", scoped: true },
        { resource: "candidates", icon: "group", scoped: true },
        { resource: "submissions", icon: "kanban", scoped: true },
        { resource: "interviews", icon: "event", scoped: true },
      ],
    },
    {
      key: "groups.crm",
      rows: [
        { resource: "clients", icon: "domain", scoped: true },
        { resource: "contacts", icon: "contacts", scoped: true },
      ],
    },
    {
      key: "groups.administration",
      rows: [
        { resource: "members", icon: "manage-accounts", scoped: false },
        { resource: "roles", icon: "admin-panel-settings", scoped: false },
        { resource: "workspace", icon: "settings", scoped: false },
        { resource: "integrations", icon: "hub", scoped: false },
        { resource: "security", icon: "shield", scoped: false },
        { resource: "billing", icon: "credit-card", scoped: false },
        { resource: "audit", icon: "article", scoped: false },
      ],
    },
    {
      key: "groups.analytics",
      rows: [
        { resource: "reports", icon: "monitoring", scoped: true },
        { resource: "revenue", icon: "payments", scoped: true },
        { resource: "commissions", icon: "request-quote", scoped: true },
      ],
    },
    {
      key: "groups.ai",
      rows: [
        { resource: "ai", icon: "sparkle", scoped: false },
        { resource: "templates", icon: "mail", scoped: false },
      ],
    },
  ],
  scopes: ["own", "team", "all"],
  roleIcons: {
    owner: "shield-person",
    admin: "admin-panel-settings",
    accountManager: "handshake",
    profileLead: "supervisor-account",
    recruiter: "person-search",
    sourcer: "travel-explore",
    hiringManager: "fact-check",
    client: "corporate-fare",
  },
  lockedRoles: ["owner"],
  manageAccess: { resource: "roles", action: ["manage"] },
  createAccess: { resource: "roles", action: ["create"] },
  reassignTo: "recruiter",
  customRoleIcon: "certificate",
  membersLink: { routeId: "Recruit.SettingsMembers.Route" },
};
