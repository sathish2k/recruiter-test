import type { TableRendererConfig } from "@recruit/shared";

export interface EmployeeRolesConfig {
  table: TableRendererConfig;
}

const table: TableRendererConfig = {
  header: {
    title: "title",
    subtitle: "subtitle",
    action: {
      id: "Recruit.EmployeeRoles.Component",
      label: { name: "viewAll" },
      routeId: "Recruit.Jobs.Route",
    },
    actionIcon: "arrow-forward",
  },
  emptyLabel: "noData",
  columns: [
    {
      label: { name: "columns.role" },
      value: {
        type: "entity",
        bgPath: "logoBg",
        fgPath: "logoFg",
        textPath: "clientInitial",
        title: "title",
        subtitle: "client",
      },
    },
    {
      label: { name: "columns.invites" },
      align: "right",
      value: { type: "number", path: "invites" },
    },
    {
      label: { name: "columns.connected" },
      align: "right",
      value: { type: "number", path: "connected" },
    },
    {
      label: { name: "columns.cvs" },
      align: "right",
      value: { type: "cvs" },
    },
    {
      label: { name: "columns.nextStep" },
      value: { type: "nextStep" },
    },
  ],
  footer: {
    cells: [
      {
        type: "static-translation",
        id: "Recruit.EmployeeRoles.Component",
        key: "totals",
        value: "roles",
      },
      { type: "number", path: "invites" },
      { type: "number", path: "connected" },
      { type: "number", path: "cvs" },
      {
        type: "static-translation",
        id: "Recruit.EmployeeRoles.Component",
        key: "totalsClients",
        value: "clients",
      },
    ],
  },
};

export const EmployeeRolesConfiguration: EmployeeRolesConfig = {
  table,
};
