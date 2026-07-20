import type { TableFilterExportConfig } from "@recruit/shared";

export const InvitationsConfiguration: TableFilterExportConfig = {
  columns: [
    {
      label: { name: "columns.email" },
      sort: { key: "email" },
      value: { type: "string", path: "email", sx: { fontWeight: 600 } },
    },
    {
      label: { name: "columns.role" },
      value: {
        type: "status",
        path: "role",
        variant: "soft",
        labels: {
          admin: "roles.admin",
          lead: "roles.lead",
          employee: "roles.employee",
          client: "roles.client",
        },
        colors: {
          admin: "primary",
          lead: "info",
          employee: "success",
          client: "default",
        },
      },
    },
    {
      label: { name: "columns.sent" },
      value: { type: "string", path: "sent", sx: { color: "text.secondary", fontSize: 12.5 } },
    },
    {
      label: { name: "columns.expires" },
      value: { type: "string", path: "expires", sx: { color: "text.secondary", fontSize: 12.5 } },
    },
  ],
  filters: [{ type: "search", key: "search", placeholder: "filters.search" }],
  export: {
    types: [{ label: "exportTypes.csv", value: "csv", icon: "csv" }],
  },
  actions: [
    { type: "resend", icon: "mail", label: { name: "actions.resend" } },
    { type: "cancel", icon: "close", label: { name: "actions.cancel" } },
  ],
  actionsLabel: { name: "columns.actions" },
  emptyLabel: "empty",
  pagination: { pageSize: 5 },
};
