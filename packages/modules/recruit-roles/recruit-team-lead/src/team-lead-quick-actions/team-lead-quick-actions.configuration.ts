import type { QuickActionsRendererConfig } from "@recruit/shared";

/**
 * The action tiles the design draws for this role — they differ per seat, and
 * are not the same list filtered by permission. Each still carries the
 * capability its form needs, so a seat that loses one loses the tile too.
 *
 * Where the design points at a screen that does not exist yet (an interviews
 * calendar, an offer builder), the tile goes to the nearest screen that does.
 */
export const TeamLeadQuickActionsConfiguration: QuickActionsRendererConfig = {
  title: "title",
  actions: [
    {
      label: "reviewQueue",
      icon: "rate-review",
      tone: "warning",
      link: {
        id: "Recruit.TeamLead.DashboardQuickActions.Component",
        linkType: "route",
        routeId: "Recruit.CandidateBoard.Route",
        underline: "none",
        color: "inherit",
      },
      access: { resource: "submissions", action: ["review"] },
    },
    {
      label: "submitShortlist",
      icon: "send",
      tone: "primary",
      link: {
        id: "Recruit.TeamLead.DashboardQuickActions.Component",
        linkType: "route",
        routeId: "Recruit.CandidateBoard.Route",
        underline: "none",
        color: "inherit",
      },
      access: { resource: "submissions", action: ["submit"] },
    },
    {
      label: "returnToRecruiter",
      icon: "undo",
      tone: "error",
      link: {
        id: "Recruit.TeamLead.DashboardQuickActions.Component",
        linkType: "route",
        routeId: "Recruit.Candidates.Route",
        underline: "none",
        color: "inherit",
      },
      access: { resource: "candidates", action: ["read"] },
    },
    {
      label: "teamActivity",
      icon: "monitoring",
      tone: "violet",
      link: {
        id: "Recruit.TeamLead.DashboardQuickActions.Component",
        linkType: "route",
        routeId: "Recruit.SettingsMembers.Route",
        underline: "none",
        color: "inherit",
      },
      access: { resource: "members", action: ["view"] },
    },
  ],
};
