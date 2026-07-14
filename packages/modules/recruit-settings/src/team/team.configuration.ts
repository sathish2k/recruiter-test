import type {
  JsonSchema,
  RoleOption,
  TableRendererConfig,
} from "@recruit/shared";

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

const table: TableRendererConfig = {
  columns: [
    {
      label: { name: "members.columns.member" },
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
      label: { name: "members.columns.role" },
      value: {
        type: "role",
        id: "Recruit.Settings.Component",
        path: "role",
        action: "changeRole",
        changeLabel: "changeRole",
        options: roles,
      },
    },
    {
      label: { name: "members.columns.status" },
      value: {
        type: "status",
        path: "status",
        variant: "soft",
        labels: { active: "status.active", invited: "status.invited" },
        colors: statusColors,
      },
    },
    {
      label: { name: "members.columns.lastActive" },
      value: {
        type: "string",
        path: "lastActive",
        sx: { color: "text.secondary", fontSize: 12.5 },
      },
    },
  ],
  actions: [
    {
      type: "resendInvite",
      icon: "mail",
      label: { name: "actions.resendInvite" },
    },
    {
      type: "deactivate",
      icon: "person-off",
      label: { name: "actions.deactivate" },
    },
  ],
  actionsLabel: { name: "members.columns.actions" },
  emptyLabel: "members.empty",
};

export const TeamConfiguration = {
  seatLimit: 5,
  roles,
  statusColors,
  table,
  inviteForm: {
    type: "object",
    properties: {
      email: {
        type: "string",
        format: "email",
        title: "inviteForm.email",
        placeholder: "inviteForm.emailPlaceholder",
        errorMessage: "inviteForm.errors.email",
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
  } as JsonSchema,
};
