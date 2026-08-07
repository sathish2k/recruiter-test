import type { QuickActionsRendererConfig } from "@recruit/shared";

/**
 * The action tiles the design draws for this role — they differ per seat, and
 * are not the same list filtered by permission. Each still carries the
 * capability its form needs, so a seat that loses one loses the tile too.
 *
 * Where the design points at a screen that does not exist yet (an interviews
 * calendar, an offer builder), the tile goes to the nearest screen that does.
 */
export const RecruiterQuickActionsConfiguration: QuickActionsRendererConfig = {
  title: "title",
  actions: [
    {
      label: "submitCandidate",
      icon: "send",
      tone: "primary",
      link: {
        id: "Recruit.Recruiter.DashboardQuickActions.Component",
        linkType: "route",
        routeId: "Recruit.CandidateBoard.Route",
        underline: "none",
        color: "inherit",
      },
      access: { resource: "submissions", action: ["submit"] },
    },
    {
      label: "addCandidate",
      icon: "person-add",
      tone: "info",
      link: {
        id: "Recruit.Recruiter.DashboardQuickActions.Component",
        linkType: "route",
        routeId: "Recruit.CandidateNew.Route",
        underline: "none",
        color: "inherit",
      },
      access: { resource: "candidates", action: ["create"] },
    },
    {
      label: "newJob",
      icon: "add-box",
      tone: "warning",
      link: {
        id: "Recruit.Recruiter.DashboardQuickActions.Component",
        linkType: "route",
        routeId: "Recruit.JobNew.Route",
        underline: "none",
        color: "inherit",
      },
      access: { resource: "jobs", action: ["create"] },
    },
    {
      label: "openBoard",
      icon: "event-available",
      tone: "violet",
      link: {
        id: "Recruit.Recruiter.DashboardQuickActions.Component",
        linkType: "route",
        routeId: "Recruit.CandidateBoard.Route",
        underline: "none",
        color: "inherit",
      },
      access: { resource: "candidates", action: ["read"] },
    },
  ],
};
