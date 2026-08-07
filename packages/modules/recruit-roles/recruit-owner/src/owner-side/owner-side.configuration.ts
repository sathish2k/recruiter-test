import type { SideListRendererConfig } from "@recruit/shared";

export const OwnerSideConfiguration: SideListRendererConfig = {
  title: "title",
  subtitle: "subtitle",
  badgeShape: "rounded",
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
    id: "Recruit.Owner.DashboardSide.Component",
    linkType: "route",
    routeId: "Recruit.Clients.Route",
    viewAllLabel: "viewAll",
    underline: "none",
  },
};
