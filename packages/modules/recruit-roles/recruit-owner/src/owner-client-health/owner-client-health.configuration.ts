import type { TableRendererConfig } from "@recruit/shared";

export const OwnerClientHealthConfiguration: TableRendererConfig = {
  variant: "panel",
  header: {
    title: "title",
    subtitle: "subtitle",
    action: {
      id: "Recruit.Owner.DashboardClientHealth.Component",
      linkType: "route",
      routeId: "Recruit.Clients.Route",
      label: { name: "viewAll" },
      underline: "none",
    },
  },
  emptyState: { icon: "domain", title: "empty.title", description: "empty.description" },
  rowRouteId: "Recruit.ClientDetail.Route",
  columns: [
    {
      label: { name: "columns.client" },
      value: {
        type: "entity",
        shape: "square",
        size: 28,
        textPath: "badge",
        hashPath: "name",
        title: "name",
        subtitle: "contact",
      },
    },
    {
      label: { name: "columns.openRoles" },
      align: "right",
      value: { type: "number", path: "openRoles" },
    },
    {
      label: { name: "columns.placed" },
      align: "right",
      value: { type: "number", path: "placed" },
    },
    {
      label: { name: "columns.health" },
      value: {
        type: "status",
        path: "health",
        id: "Recruit.Owner.DashboardClientHealth.Component",
        dot: true,
        labels: { healthy: "health.healthy", at_risk: "health.atRisk" },
        colors: { healthy: "success", at_risk: "error" },
      },
    },
  ],
};
