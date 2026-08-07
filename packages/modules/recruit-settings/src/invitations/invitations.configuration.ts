import type { ChipProps } from "@mui/material/Chip";
import type { TableFilterExportConfig } from "@recruit/shared";

const roleColors: Record<string, ChipProps["color"]> = {
  owner: "secondary",
  admin: "primary",
  profileLead: "info",
  recruiter: "default",
  sourcer: "default",
};

export const InvitationsConfiguration: TableFilterExportConfig = {
  variant: "list",
  header: { title: "title", subtitle: "subtitle" },
  columns: [
    {
      label: { name: "columns.email" },
      width: "26%",
      sort: { key: "email" },
      value: { type: "string", path: "email", sx: { fontWeight: 700, fontSize: 13 } },
    },
    {
      label: { name: "columns.sentBy" },
      width: "18%",
      value: {
        type: "entity",
        shape: "circle",
        size: 24,
        hashPath: "invitedByName",
        title: "invitedByName",
        titleSx: { fontSize: 12, fontWeight: 500 },
      },
    },
    {
      label: { name: "columns.date" },
      width: "13%",
      sort: { key: "sentOn" },
      value: { type: "string", path: "sentOn", sx: { fontSize: 12.5 } },
    },
    {
      label: { name: "columns.role" },
      width: "14%",
      value: {
        type: "status",
        id: "Recruit.SettingsInvitations.Component",
        path: "role",
        variant: "soft",
        labels: {
          owner: "roles.owner",
          admin: "roles.admin",
          profileLead: "roles.profileLead",
          recruiter: "roles.recruiter",
          sourcer: "roles.sourcer",
        },
        colors: roleColors,
      },
    },
    {
      label: { name: "columns.expires" },
      width: "17%",
      sort: { key: "daysLeft" },
      value: { type: "expiry" },
    },
  ],
  actions: [
    { type: "resend", icon: "send", label: { name: "actions.resend" } },
    { type: "cancel", icon: "delete", label: { name: "actions.cancel" } },
  ],
  actionsLabel: { name: "columns.actions" },
  emptyLabel: "empty",
  pagination: { pageSize: 5 },
};
