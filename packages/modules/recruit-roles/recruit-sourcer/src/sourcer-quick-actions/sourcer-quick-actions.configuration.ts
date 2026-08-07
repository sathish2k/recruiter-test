import type { QuickActionsRendererConfig } from "@recruit/shared";

/**
 * The action tiles the design draws for this role — they differ per seat, and
 * are not the same list filtered by permission. Each still carries the
 * capability its form needs, so a seat that loses one loses the tile too.
 *
 * Where the design points at a screen that does not exist yet (an interviews
 * calendar, an offer builder), the tile goes to the nearest screen that does.
 */
export const SourcerQuickActionsConfiguration: QuickActionsRendererConfig = {
  title: "title",
  actions: [
    {
      label: "addCandidate",
      icon: "person-add",
      tone: "primary",
      link: {
        id: "Recruit.Sourcer.DashboardQuickActions.Component",
        linkType: "route",
        routeId: "Recruit.CandidateNew.Route",
        underline: "none",
        color: "inherit",
      },
      access: { resource: "candidates", action: ["create"] },
    },
    {
      label: "uploadResume",
      icon: "upload-file",
      tone: "violet",
      link: {
        id: "Recruit.Sourcer.DashboardQuickActions.Component",
        linkType: "route",
        routeId: "Recruit.CandidateImport.Route",
        underline: "none",
        color: "inherit",
      },
      access: { resource: "candidates", action: ["create"] },
    },
    {
      label: "assignRecruiter",
      icon: "assignment-ind",
      tone: "success",
      link: {
        id: "Recruit.Sourcer.DashboardQuickActions.Component",
        linkType: "route",
        routeId: "Recruit.Candidates.Route",
        underline: "none",
        color: "inherit",
      },
      access: { resource: "candidates", action: ["edit"] },
    },
    {
      label: "assignedJobs",
      icon: "extension",
      tone: "info",
      link: {
        id: "Recruit.Sourcer.DashboardQuickActions.Component",
        linkType: "route",
        routeId: "Recruit.Jobs.Route",
        underline: "none",
        color: "inherit",
      },
      access: { resource: "jobs", action: ["read"] },
    },
  ],
};
