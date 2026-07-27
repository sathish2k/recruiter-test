import type { StatCardRendererConfig } from "@recruit/shared";

export const DashboardStatsConfiguration: StatCardRendererConfig[] = [
  {
    label: { name: "stats.openRoles" },
    value: { type: "number", path: "openRoles" },
    delta: { name: "stats.openRolesDelta", value: "openedThisWeek", variant: "pill" },
    sub: { name: "stats.openRolesSub" },
    link: {
      id: "Recruit.DashboardStats.Component",
      linkType: "route",
      routeId: "Recruit.Jobs.Route",
      target: "_self",
      color: "inherit",
      underline: "none",
      sx: { display: "block" },
    },
  },
  {
    label: { name: "stats.activeCandidates" },
    value: { type: "number", path: "activeCandidates" },
    delta: { name: "stats.activeCandidatesDelta", value: "activeCandidatesDelta", variant: "pill" },
    sub: { name: "stats.activeCandidatesSub" },
    link: {
      id: "Recruit.DashboardStats.Component",
      linkType: "route",
      routeId: "Recruit.Candidates.Route",
      target: "_self",
      color: "inherit",
      underline: "none",
      sx: { display: "block" },
    },
  },
  {
    label: { name: "stats.submissions" },
    value: { type: "number", path: "submissions" },
    sub: { name: "stats.submissionsSub" },
    link: {
      id: "Recruit.DashboardStats.Component",
      linkType: "route",
      routeId: "Recruit.Pipeline.Route",
      target: "_self",
      color: "inherit",
      underline: "none",
      sx: { display: "block" },
    },
  },
];
