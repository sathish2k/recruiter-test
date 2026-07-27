import type { ListRendererConfig } from "@recruit/shared";

const ID = "Recruit.DashboardActivityFeed.Component";

export const DashboardActivityFeedConfiguration: ListRendererConfig = {
  title: { name: "title" },
  headerTextLink: {
    label: { name: "viewAll" },
    link: {
      id: ID,
      linkType: "route",
      routeId: "Recruit.TeamActivity.Route",
      target: "_self",
      underline: "none",
      color: "inherit",
    },
  },
  variant: "timeline",
  headerGap: "12px",
  row: {
    keyPath: "id",
    // Severity drives the dot colour; the API sends the raw audit severity.
    leading: { type: "dot", size: 8, colorPath: "dotColor" },
    title: { type: "text", path: "text" },
    description: {
      type: "date",
      path: "at",
      options: { hour: "numeric", minute: "2-digit" },
    },
  },
  emptyText: { name: "empty" },
  skeletonRows: 4,
};
