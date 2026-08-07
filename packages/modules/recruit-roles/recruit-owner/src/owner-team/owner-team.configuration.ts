import type { TableRendererConfig } from "@recruit/shared";

export const OwnerTeamConfiguration: TableRendererConfig = {
  variant: "panel",
  header: {
    title: "title",
    subtitle: "subtitle",
    action: {
      id: "Recruit.Owner.DashboardTeam.Component",
      linkType: "route",
      routeId: "Recruit.SettingsMembers.Route",
      label: { name: "viewAll" },
      underline: "none",
    },
  },
  emptyState: {
    icon: "group",
    title: "empty.title",
    description: "empty.description",
  },
  columns: [
    {
      label: { name: "columns.recruiter" },
      value: {
        type: "entity",
        shape: "circle",
        size: 28,
        textPath: "initials",
        hashPath: "name",
        title: "name",
        subtitle: "role",
      },
    },
    { label: { name: "columns.jobs" }, align: "right", value: { type: "number", path: "jobs" } },
    {
      label: { name: "columns.cands" },
      align: "right",
      value: { type: "number", path: "candidates" },
    },
    {
      label: { name: "columns.subs" },
      align: "right",
      value: { type: "number", path: "submissions" },
    },
    {
      label: { name: "columns.intvs" },
      align: "right",
      value: { type: "number", path: "interviews" },
    },
    {
      label: { name: "columns.offers" },
      align: "right",
      value: { type: "number", path: "offers" },
    },
    {
      label: { name: "columns.placed" },
      align: "right",
      value: { type: "number", path: "placed" },
    },
    {
      label: { name: "columns.conv" },
      align: "right",
      value: { type: "text", path: "conversion", colorPath: "conversionTone" },
    },
    {
      label: { name: "columns.sla" },
      align: "right",
      value: { type: "text", path: "sla", colorPath: "slaTone" },
    },
  ],
};
