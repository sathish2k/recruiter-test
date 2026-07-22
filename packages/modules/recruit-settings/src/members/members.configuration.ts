import type { RoleOption, TableFilterExportConfig } from "@recruit/shared";

const roles: RoleOption[] = [
  { value: "admin", label: "roles.admin", color: "primary" },
  { value: "lead", label: "roles.lead", color: "info" },
  { value: "employee", label: "roles.employee", color: "success" },
  { value: "client", label: "roles.client", color: "default" },
];

const statusColors: Record<string, "success" | "warning" | "error"> = {
  active: "success",
  invited: "warning",
  suspended: "error",
};

/** The component config IS the table config, so the feature renders in one
 * line: `<TableFilterExportRenderer id={id} />`. `seatLimit` rides along for
 * the "x of y seats used" line. */
export const MembersConfiguration: TableFilterExportConfig & { seatLimit: number } = {
  seatLimit: 5,
  header: { title: "title" },
  columns: [
    {
      label: { name: "columns.member" },
      width: "27%",
      sort: { key: "member" },
      value: {
        type: "entity",
        shape: "circle",
        bgPath: "avatarBg",
        fgPath: "avatarFg",
        textPath: "initials",
        title: "displayName",
        subtitle: "email",
        suffixPath: "isCurrentUser",
      },
    },
    {
      label: { name: "columns.role" },
      width: "14.2%",
      sort: { key: "role" },
      value: {
        type: "role",
        id: "Recruit.SettingsMembers.Component",
        path: "role",
        action: "changeRole",
        changeLabel: "actions.changeRole",
        options: roles,
        lockedPath: "isOwner",
        lockedValues: ["admin"],
        lockedHint: "roleLockedHint",
      },
    },
    {
      label: { name: "columns.clientAccess" },
      width: "20.3%",
      value: { type: "clientAccess" },
    },
    {
      label: { name: "columns.status" },
      width: "11.5%",
      sort: { key: "status" },
      value: {
        type: "status",
        path: "status",
        variant: "soft",
        // The design's member status always carries a leading dot.
        dot: true,
        labels: {
          active: "status.active",
          invited: "status.invited",
          suspended: "status.suspended",
        },
        colors: statusColors,
      },
    },
    {
      label: { name: "columns.mfa" },
      width: "12.2%",
      value: { type: "mfa" },
    },
    {
      label: { name: "columns.lastActive" },
      width: "10.8%",
      sort: { key: "lastActive" },
      value: { type: "lastActive" },
    },
  ],
  filters: [
    { type: "search", key: "search", placeholder: "filters.search" },
    {
      type: "select",
      key: "role",
      label: { name: "filters.role" },
      options: [
        { value: "admin", label: "roles.admin" },
        { value: "lead", label: "roles.lead" },
        { value: "employee", label: "roles.employee" },
        { value: "client", label: "roles.client" },
      ],
    },
    {
      type: "select",
      key: "status",
      label: { name: "filters.status" },
      options: [
        { value: "active", label: "status.active" },
        { value: "invited", label: "status.invited" },
        { value: "suspended", label: "status.suspended" },
      ],
    },
  ],
  // The owner can't be re-invited, suspended or removed, and their profile is
  // reached from their own account rather than this table.
  actions: [
    {
      type: "viewProfile",
      icon: "person",
      label: { name: "actions.viewProfile" },
      hideWhen: "isOwner",
    },
    { type: "resetPassword", icon: "lock-reset", label: { name: "actions.resetPassword" } },
    {
      type: "resendInvite",
      icon: "mail",
      label: { name: "actions.resendInvite" },
      hideWhen: "isOwner",
    },
    {
      type: "suspend",
      icon: "person-off",
      label: { name: "actions.suspend" },
      hideWhen: "isOwner",
    },
    { type: "remove", icon: "delete", label: { name: "actions.remove" }, hideWhen: "isOwner" },
  ],
  emptyLabel: "empty",
  // The design's invite modal: a multi-email textarea over a two-column
  // role / client-access row.
  addForm: {
    type: "object",
    properties: {
      emails: {
        type: "string",
        widget: "textarea",
        rows: 3,
        title: "inviteForm.emails",
        placeholder: "inviteForm.emailsPlaceholder",
        grid: { size: 12 },
      },
      role: {
        type: "string",
        widget: "select",
        title: "inviteForm.role",
        enum: ["admin", "lead", "employee", "client"],
        default: "employee",
        grid: { size: 6 },
      },
      clientAccess: {
        type: "string",
        widget: "select",
        title: "inviteForm.clientAccess",
        enum: ["all", "unassigned"],
        default: "all",
        grid: { size: 6 },
      },
    },
    required: ["emails", "role"],
    errorMessage: {
      required: {
        emails: "inviteForm.errors.emails",
        role: "inviteForm.errors.role",
      },
    },
  },
};
