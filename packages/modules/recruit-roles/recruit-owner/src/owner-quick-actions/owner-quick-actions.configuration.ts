import type { QuickActionsRendererConfig } from "@recruit/shared";

/**
 * The action tiles the design draws for this role — they differ per seat, and
 * are not the same list filtered by permission. Each still carries the
 * capability its form needs, so a seat that loses one loses the tile too.
 *
 * Where the design points at a screen that does not exist yet (an interviews
 * calendar, an offer builder), the tile goes to the nearest screen that does.
 */
export const OwnerQuickActionsConfiguration: QuickActionsRendererConfig = {
  title: "title",
  actions: [
    {
      label: "newJob",
      icon: "add-box",
      tone: "primary",
      link: {
        id: "Recruit.Owner.DashboardQuickActions.Component",
        linkType: "route",
        routeId: "Recruit.JobNew.Route",
        underline: "none",
        color: "inherit",
      },
      access: { resource: "jobs", action: ["create"] },
    },
    {
      label: "addCandidate",
      icon: "person-add",
      tone: "info",
      link: {
        id: "Recruit.Owner.DashboardQuickActions.Component",
        linkType: "route",
        routeId: "Recruit.CandidateNew.Route",
        underline: "none",
        color: "inherit",
      },
      access: { resource: "candidates", action: ["create"] },
    },
    {
      label: "addClient",
      icon: "domain-add",
      tone: "success",
      link: {
        id: "Recruit.Owner.DashboardQuickActions.Component",
        linkType: "route",
        routeId: "Recruit.ClientNew.Route",
        underline: "none",
        color: "inherit",
      },
      access: { resource: "clients", action: ["create"] },
    },
    {
      label: "openBoard",
      icon: "event-available",
      tone: "violet",
      link: {
        id: "Recruit.Owner.DashboardQuickActions.Component",
        linkType: "route",
        routeId: "Recruit.CandidateBoard.Route",
        underline: "none",
        color: "inherit",
      },
      access: { resource: "submissions", action: ["view"] },
    },
  ],
  secondary: {
    label: "runningTheBusiness",
    actions: [
      {
        label: "leaderboard",
        icon: "leaderboard",
        link: {
          id: "Recruit.Owner.DashboardQuickActions.Component",
          linkType: "route",
          routeId: "Recruit.SettingsMembers.Route",
          underline: "none",
          color: "inherit",
        },
        access: { resource: "members", action: ["view"] },
      },
      {
        label: "finance",
        icon: "account-balance",
        link: {
          id: "Recruit.Owner.DashboardQuickActions.Component",
          linkType: "route",
          routeId: "Recruit.SettingsBilling.Route",
          underline: "none",
          color: "inherit",
        },
        access: { resource: "billing", action: ["view"] },
      },
      {
        label: "inviteTeam",
        icon: "group-add",
        link: {
          id: "Recruit.Owner.DashboardQuickActions.Component",
          linkType: "route",
          routeId: "Recruit.SettingsMembers.Route",
          underline: "none",
          color: "inherit",
        },
        access: { resource: "members", action: ["invite"] },
      },
    ],
  },
};
