import type { SideListRendererConfig } from "@recruit/shared";

export const RecruiterSideConfiguration: SideListRendererConfig = {
  title: "title",
  subtitle: "subtitle",
  badgeShape: "square",
  limit: 4,
  paths: {
    badge: "badge",
    // No chip row: the design draws this one as badge / name / what · where / time.
    title: "title",
    subtitle: "subtitle",
    value: "value",
    tone: "tone",
  },
  viewAll: {
    id: "Recruit.Recruiter.DashboardSide.Component",
    linkType: "route",
    routeId: "Recruit.Clients.Route",
    viewAllLabel: "viewAll",
    underline: "none",
  },
};
