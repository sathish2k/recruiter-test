import type { ChipProps } from "@mui/material/Chip";
import type { JsonSchema, TableFilterExportConfig } from "@recruit/shared";

/** The seats a workspace hands out, in seniority order. Not a permission
 * check — these are the roles the invite and edit dialogs offer, and the
 * labels/tones the table prints. What each one may do lives in the permission
 * matrix, never in a branch on these values. */
export const MEMBER_ROLES = ["owner", "admin", "profileLead", "recruiter", "sourcer"] as const;

/** Owner and admin are the workspace's two keys; only an owner grants them. */
const OWNER_ONLY: string[] = ["owner", "admin"];

const roleColors: Record<string, ChipProps["color"]> = {
  owner: "secondary",
  admin: "primary",
  profileLead: "info",
  recruiter: "default",
  sourcer: "default",
};

const roleLabels = Object.fromEntries(MEMBER_ROLES.map((role) => [role, `roles.${role}`]));

const statusColors: Record<string, ChipProps["color"]> = {
  active: "success",
  invited: "info",
  inactive: "default",
  suspended: "error",
};

const statusIcons: Record<string, string> = {
  active: "check-circle",
  invited: "mail",
  inactive: "do-not-disturb",
  suspended: "pause-circle",
};

export interface MembersConfig extends TableFilterExportConfig {
  /** Fallback seat allowance for a cold cache — the plan's real number rides
   * in the fetch meta. */
  seatLimit: number;
  /** Roles offered by the invite and edit dialogs. */
  roles: readonly string[];
  /** Roles only an owner may grant; anyone else sees them locked with a reason. */
  ownerOnlyRoles: string[];
  /** Where the header's "Roles & permissions" button goes. */
  rolesRouteId: string;
  /** JSON-schema for the edit dialog, the twin of `addForm`. */
  editForm: JsonSchema;
}

export const MembersConfiguration: MembersConfig = {
  seatLimit: 5,
  roles: MEMBER_ROLES,
  ownerOnlyRoles: OWNER_ONLY,
  rolesRouteId: "Recruit.SettingsRoles.Route",
  variant: "list",
  selectable: true,
  header: { title: "title" },
  columns: [
    {
      label: { name: "columns.member" },
      width: "30%",
      sort: { key: "member" },
      value: { type: "member" },
    },
    {
      label: { name: "columns.role" },
      width: "14%",
      sort: { key: "role" },
      value: {
        type: "status",
        id: "Recruit.SettingsMembers.Component",
        path: "role",
        variant: "soft",
        labels: roleLabels,
        colors: roleColors,
      },
    },
    {
      label: { name: "columns.team" },
      width: "14%",
      sort: { key: "team" },
      value: { type: "string", path: "team", placeholder: "—", sx: { fontSize: 12.5 } },
    },
    {
      label: { name: "columns.status" },
      width: "13%",
      sort: { key: "status" },
      value: {
        type: "status",
        id: "Recruit.SettingsMembers.Component",
        path: "status",
        variant: "soft",
        labels: {
          active: "status.active",
          invited: "status.invited",
          inactive: "status.inactive",
          suspended: "status.suspended",
        },
        colors: statusColors,
        icons: statusIcons,
      },
    },
    {
      label: { name: "columns.lastActive" },
      width: "14%",
      sort: { key: "lastActive" },
      value: { type: "lastActive" },
    },
  ],
  filters: [
    { type: "search", key: "search", placeholder: "filters.search" },
    {
      type: "segmented",
      key: "status",
      label: { name: "filters.status" },
      options: [
        { value: "", label: "filters.all" },
        { value: "active", label: "status.active" },
        { value: "invited", label: "status.invited" },
        { value: "inactive", label: "status.inactive" },
        { value: "suspended", label: "status.suspended" },
      ],
    },
    {
      type: "select",
      key: "role",
      icon: "badge",
      label: { name: "filters.role" },
      options: MEMBER_ROLES.map((role) => ({ value: role, label: `roles.${role}` })),
    },
    // Desk names are whatever the workspace has typed, so the options come from
    // the fetch meta rather than a fixed list.
    { type: "select", key: "team", icon: "groups", label: { name: "filters.team" } },
  ],
  export: { types: [{ label: "exportTypes.csv", value: "csv", icon: "csv" }] },
  bulkActions: [
    { type: "deactivate", icon: "person-off", label: { name: "actions.deactivate" } },
    { type: "export", icon: "download", label: { name: "actions.export" } },
  ],
  // Resending lives in the pending-invitations card below: an invitation has no
  // account behind it yet, so it is not a row here to act on.
  actions: [
    { type: "viewProfile", icon: "account-circle", label: { name: "actions.viewProfile" } },
    { type: "edit", icon: "edit", label: { name: "actions.edit" } },
    { type: "resetPassword", icon: "lock-reset", label: { name: "actions.resetPassword" } },
    {
      type: "activate",
      icon: "person-check",
      label: { name: "actions.activate" },
      showWhen: "isInactive",
    },
    {
      type: "deactivate",
      icon: "person-off",
      label: { name: "actions.deactivate" },
      hideWhen: "isInactive",
    },
  ],
  actionsLabel: { name: "columns.actions" },
  emptyLabel: "empty",
  emptyState: {
    icon: "group-add",
    title: "emptyState.title",
    description: "emptyState.description",
    actions: [{ action: "add", icon: "person-add", text: "actions.invite", variant: "contained" }],
  },
  pagination: { pageSize: 10 },
  // The invite dialog: one address, then the role that decides what they walk
  // into. Both dialogs share the role picker, so both read the same detail.
  addForm: {
    type: "object",
    properties: {
      email: {
        type: "string",
        format: "email",
        title: "inviteForm.email",
        placeholder: "inviteForm.emailPlaceholder",
      },
      role: {
        type: "string",
        widget: "option-cards",
        title: "inviteForm.role",
        default: "recruiter",
        choices: MEMBER_ROLES.map((role) => ({
          value: role,
          label: `roles.${role}`,
          meta: `roleDetail.${role}`,
        })),
      },
    },
    required: ["email", "role"],
    errorMessage: {
      required: {
        email: "inviteForm.errors.email",
        role: "inviteForm.errors.role",
      },
      properties: { email: "inviteForm.errors.emailFormat" },
    },
  },
  // The edit dialog: name, team and role. The address is the sign-in identity
  // and is theirs to change from their own profile.
  editForm: {
    type: "object",
    properties: {
      displayName: {
        type: "string",
        title: "editForm.name",
        placeholder: "editForm.namePlaceholder",
      },
      email: {
        type: "string",
        title: "editForm.email",
        readOnly: true,
        help: "editForm.emailHelp",
      },
      team: {
        type: "string",
        title: "editForm.team",
        optional: true,
        placeholder: "editForm.teamPlaceholder",
      },
      role: {
        type: "string",
        widget: "option-cards",
        title: "editForm.role",
        choices: MEMBER_ROLES.map((role) => ({
          value: role,
          label: `roles.${role}`,
          meta: `roleDetail.${role}`,
        })),
      },
    },
    required: ["displayName", "role"],
    errorMessage: {
      required: {
        displayName: "editForm.errors.name",
        role: "inviteForm.errors.role",
      },
    },
  },
};
