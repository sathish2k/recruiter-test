import type { SideListRendererConfig } from "@recruit/shared";

export const ClientSideConfiguration: SideListRendererConfig = {
  title: "title",
  subtitle: "subtitle",
  badgeShape: "square",
  limit: 4,
  paths: {
    badge: "badge",
    title: "title",
    subtitle: "subtitle",
    value: "value",
    tone: "tone",
    meta: "meta",
    note: "note",
  },
  viewAll: {
    id: "Recruit.Client.DashboardSide.Component",
    linkType: "route",
    routeId: "Recruit.Jobs.Route",
    viewAllLabel: "viewAll",
    underline: "none",
  },
};
