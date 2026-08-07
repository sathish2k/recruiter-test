import type { QuickActionsRendererConfig } from "@recruit/shared";

/**
 * The action tiles the design draws for this role — they differ per seat, and
 * are not the same list filtered by permission. Each still carries the
 * capability its form needs, so a seat that loses one loses the tile too.
 *
 * Where the design points at a screen that does not exist yet (an interviews
 * calendar, an offer builder), the tile goes to the nearest screen that does.
 */
export const HiringManagerQuickActionsConfiguration: QuickActionsRendererConfig = {
  title: "title",
  actions: [
    {
      label: "reviewQueue",
      icon: "rate-review",
      tone: "warning",
      link: {
        id: "Recruit.HiringManager.DashboardQuickActions.Component",
        linkType: "route",
        routeId: "Recruit.CandidateBoard.Route",
        underline: "none",
        color: "inherit",
      },
      access: { resource: "submissions", action: ["review"] },
    },
    {
      label: "reviewNotes",
      icon: "edit-note",
      tone: "violet",
      link: {
        id: "Recruit.HiringManager.DashboardQuickActions.Component",
        linkType: "route",
        routeId: "Recruit.Candidates.Route",
        underline: "none",
        color: "inherit",
      },
      access: { resource: "candidates", action: ["edit"] },
    },
    {
      label: "openRoles",
      icon: "draft",
      tone: "primary",
      link: {
        id: "Recruit.HiringManager.DashboardQuickActions.Component",
        linkType: "route",
        routeId: "Recruit.Jobs.Route",
        underline: "none",
        color: "inherit",
      },
      access: { resource: "jobs", action: ["read"] },
    },
    {
      label: "interviews",
      icon: "event-available",
      tone: "success",
      link: {
        id: "Recruit.HiringManager.DashboardQuickActions.Component",
        linkType: "route",
        routeId: "Recruit.CandidateBoard.Route",
        underline: "none",
        color: "inherit",
      },
      access: { resource: "interviews", action: ["read"] },
    },
  ],
};
