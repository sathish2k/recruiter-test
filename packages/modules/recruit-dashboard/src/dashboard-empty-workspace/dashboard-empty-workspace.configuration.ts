import type { EmptyWorkspaceRendererConfig } from "@recruit/shared";

/**
 * The design's new-workspace card. `isNewWorkspace` comes from
 * `/dashboard/summary` — the API decides, so the card disappears the moment the
 * first client, role or candidate exists without the screen re-fetching.
 *
 * Each step carries the permission its form needs: a member who cannot create
 * clients is never sent to the client form, and the engine strips that step
 * server-side before the component sees the list.
 */
export const DashboardEmptyWorkspaceConfiguration: EmptyWorkspaceRendererConfig = {
  showPath: "isNewWorkspace",
  icon: "rocket-launch",
  title: "title",
  description: "description",
  steps: [
    {
      title: "client.title",
      detail: "client.detail",
      icon: "domain-add",
      tone: "primary",
      access: { resource: "clients", action: ["create"] },
      link: {
        id: "Recruit.DashboardEmptyWorkspace.Component",
        linkType: "route",
        routeId: "Recruit.ClientNew.Route",
      },
    },
    {
      title: "job.title",
      detail: "job.detail",
      icon: "work",
      tone: "info",
      access: { resource: "jobs", action: ["create"] },
      link: {
        id: "Recruit.DashboardEmptyWorkspace.Component",
        linkType: "route",
        routeId: "Recruit.JobNew.Route",
      },
    },
    {
      title: "candidate.title",
      detail: "candidate.detail",
      icon: "person-add",
      tone: "success",
      access: { resource: "candidates", action: ["create"] },
      link: {
        id: "Recruit.DashboardEmptyWorkspace.Component",
        linkType: "route",
        routeId: "Recruit.CandidateNew.Route",
      },
    },
  ],
};
