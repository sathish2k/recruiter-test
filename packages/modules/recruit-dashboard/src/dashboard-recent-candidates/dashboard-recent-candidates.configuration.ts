import type { TableRendererConfig } from "@recruit/shared";

const ID = "Recruit.DashboardRecentCandidates.Component";

export const DashboardRecentCandidatesConfiguration: TableRendererConfig = {
  header: {
    icon: "group",
    title: "title",
    // Interpolated with the fetch `meta`.
    subtitle: "subtitle",
    action: {
      id: ID,
      linkType: "route",
      routeId: "Recruit.Candidates.Route",
      label: { name: "viewAll" },
      target: "_self",
      underline: "none",
      color: "inherit",
    },
    actionIcon: "arrow-forward",
  },
  columns: [
    {
      label: { name: "columns.candidate" },
      value: {
        type: "entity",
        shape: "circle",
        size: 30,
        hashPath: "name",
        title: "name",
      },
      sort: { key: "name" },
    },
    {
      label: { name: "columns.role" },
      value: { type: "text", path: "role", sx: { color: "surface.textMuted" } },
      sort: { key: "role" },
    },
    {
      label: { name: "columns.client" },
      value: { type: "text", path: "clientName", sx: { color: "text.secondary" } },
      sort: { key: "clientName" },
    },
    {
      label: { name: "columns.interview" },
      value: {
        type: "date",
        path: "interviewAt",
        options: { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" },
        placeholder: "—",
        sx: { color: "surface.textMuted" },
      },
    },
    {
      label: { name: "columns.owner" },
      value: {
        type: "entity",
        shape: "circle",
        size: 26,
        hashPath: "ownerName",
        title: "ownerName",
        titleSx: { fontSize: 12.5 },
      },
    },
    {
      label: { name: "columns.status" },
      value: {
        type: "status",
        id: ID,
        path: "stage",
        labels: {
          sourced: "stages.sourced",
          screening: "stages.screening",
          submitted: "stages.submitted",
          interview: "stages.interview",
          offer: "stages.offer",
        },
        colors: {
          sourced: "default",
          screening: "info",
          submitted: "primary",
          interview: "warning",
          offer: "success",
        },
        variant: "soft",
      },
    },
  ],
  rowRouteId: "Recruit.Candidates.Route",
  emptyLabel: "empty",
};
