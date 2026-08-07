import type { SideListRendererConfig } from "@recruit/shared";

export const SourcerSavedSearchesConfiguration: SideListRendererConfig = {
  title: "title",
  subtitle: "subtitle",
  badgeShape: "square",
  limit: 4,
  paths: { badge: "badge", title: "title", subtitle: "subtitle", value: "value", tone: "tone" },
  viewAll: {
    id: "Recruit.Sourcer.DashboardSavedSearches.Component",
    linkType: "route",
    routeId: "Recruit.Candidates.Route",
    viewAllLabel: "viewAll",
    underline: "none",
  },
};
