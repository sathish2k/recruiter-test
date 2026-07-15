import type { TableRendererConfig } from "@recruit/shared";

export const LeadSourcersConfiguration: TableRendererConfig = {
  header: {
    icon: "group",
    title: "title",
    subtitle: "subtitle",
  },
  columns: [
    {
      label: { name: "columns.employee" },
      value: {
        type: "entity",
        shape: "circle",
        bgPath: "avatarBg",
        fgPath: "avatarFg",
        textPath: "initials",
        title: "name",
      },
    },
    {
      label: { name: "columns.cvs" },
      align: "right",
      value: { type: "number", path: "cvs" },
    },
    {
      label: { name: "columns.submitted" },
      align: "right",
      value: { type: "number", path: "submitted" },
    },
    {
      label: { name: "columns.approval" },
      align: "right",
      value: { type: "string", path: "approval", sx: { color: "#8FD6AC" } },
    },
  ],
};
