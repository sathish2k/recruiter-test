import type { SideListRendererConfig } from "@recruit/shared";

export const HiringManagerSideConfiguration: SideListRendererConfig = {
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
    id: "Recruit.HiringManager.DashboardSide.Component",
    linkType: "route",
    routeId: "Recruit.Candidates.Route",
    viewAllLabel: "viewAll",
    underline: "none",
  },
};
