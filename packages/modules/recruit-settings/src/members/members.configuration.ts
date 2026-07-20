import type { RoleOption, TableFilterExportConfig } from "@recruit/shared";

const roles: RoleOption[] = [
  { value: "admin", label: "roles.admin", color: "primary" },
  { value: "lead", label: "roles.lead", color: "info" },
  { value: "employee", label: "roles.employee", color: "success" },
  { value: "client", label: "roles.client", color: "default" },
];

const statusColors: Record<string, "success" | "warning"> = {
  active: "success",
  invited: "warning",
};

/** The component config IS the table config, so the feature renders in one
 * line: `<TableFilterExportRenderer id={id} />`. `seatLimit` rides along for
 * the "x of y seats used" line. */
export const MembersConfiguration: TableFilterExportConfig & { seatLimit: number } = {
  seatLimit: 5,
  columns: [
    {
      label: { name: "columns.member" },
      sort: { key: "member" },
      value: {
        type: "entity",
        shape: "circle",
        bgPath: "avatarBg",
        fgPath: "avatarFg",
        textPath: "initials",
        title: "displayName",
        subtitle: "email",
      },
    },
    {
      label: { name: "columns.role" },
      sort: { key: "role" },
      value: {
        type: "role",
        id: "Recruit.SettingsMembers.Component",
        path: "role",
        action: "changeRole",
        changeLabel: "actions.changeRole",
        options: roles,
      },
    },
    {
      label: { name: "columns.status" },
      sort: { key: "status" },
      value: {
        type: "status",
        path: "status",
        variant: "soft",
        labels: { active: "status.active", invited: "status.invited" },
        colors: statusColors,
      },
    },
    {
      label: { name: "columns.lastActive" },
      sort: { key: "lastActive" },
      value: {
        type: "string",
        path: "lastActive",
        sx: { color: "text.secondary", fontSize: 12.5 },
      },
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
  ],
  export: {
    types: [
      { label: "exportTypes.csv", value: "csv", icon: "csv" },
      { label: "exportTypes.xlsx", value: "xlsx", icon: "excel" },
    ],
  },
  ctas: [{ label: { name: "actions.invite" }, icon: "add", action: "add" }],
  actions: [
    { type: "resendInvite", icon: "mail", label: { name: "actions.resendInvite" } },
    { type: "deactivate", icon: "person-off", label: { name: "actions.deactivate" } },
  ],
  actionsLabel: { name: "columns.actions" },
  emptyLabel: "empty",
  pagination: { pageSize: 10 },
  addForm: {
    type: "object",
    properties: {
      email: {
        type: "string",
        format: "email",
        title: "inviteForm.email",
        placeholder: "inviteForm.emailPlaceholder",
        icon: "mail",
      },
      role: {
        type: "string",
        widget: "select",
        title: "inviteForm.role",
        enum: ["admin", "lead", "employee", "client"],
        default: "employee",
      },
    },
    required: ["email", "role"],
    errorMessage: {
      required: {
        email: "inviteForm.errors.email",
        role: "inviteForm.errors.role",
      },
    },
  },
};
