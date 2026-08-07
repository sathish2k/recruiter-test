import type { SideListRendererConfig } from "@recruit/shared";

export const TeamLeadSideConfiguration: SideListRendererConfig = {
  title: "title",
  subtitle: "subtitle",
  badgeShape: "pill",
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
    id: "Recruit.TeamLead.DashboardSide.Component",
    linkType: "route",
    routeId: "Recruit.Clients.Route",
    viewAllLabel: "viewAll",
    underline: "none",
  },
};
