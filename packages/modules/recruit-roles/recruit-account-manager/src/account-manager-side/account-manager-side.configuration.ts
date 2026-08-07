import type { SideListRendererConfig } from "@recruit/shared";

export const AccountManagerSideConfiguration: SideListRendererConfig = {
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
    id: "Recruit.AccountManager.DashboardSide.Component",
    linkType: "route",
    routeId: "Recruit.Clients.Route",
    viewAllLabel: "viewAll",
    underline: "none",
  },
};
