import type { SideListRendererConfig } from "@recruit/shared";

export const RecruiterRecentsConfiguration: SideListRendererConfig = {
  title: "title",
  subtitle: "subtitle",
  badgeShape: "pill",
  limit: 5,
  paths: {
    icon: "icon",
    title: "name",
    subtitle: "kind",
    value: "when",
    tone: "tone",
  },
  viewAll: {
    id: "Recruit.Recruiter.DashboardRecents.Component",
    linkType: "route",
    routeId: "Recruit.Candidates.Route",
    viewAllLabel: "viewAll",
    underline: "none",
  },
};
