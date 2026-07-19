import type { AccessRule } from "@recruit/sdk";

export interface SidenavItem {
  label: string;
  icon: string;
  access?: AccessRule;
  routeId: string;
}

export interface SidenavGroup {
  title: string;
  items: SidenavItem[];
}

// Nav structure. `title`/`label` are translation keys; `icon` maps to an MUI
// icon in the component; `routeId` navigates via usePortalRouter.
const groups: SidenavGroup[] = [
  {
    title: "groups.main",
    items: [
      {
        label: "items.dashboard",
        access: { resource: "dashboard" },
        icon: "dashboard",
        routeId: "Recruit.Root",
      },
      {
        label: "items.clients",
        access: { resource: "clients" },
        icon: "domain",
        routeId: "Recruit.Clients.Route",
      },
      {
        label: "items.jobs",
        access: { resource: "jobs" },
        icon: "work",
        routeId: "Recruit.Jobs.Route",
      },
      {
        label: "items.candidates",
        access: { resource: "candidates" },
        icon: "group",
        routeId: "Recruit.Candidates.Route",
      },
      {
        label: "items.pipeline",
        access: { resource: "candidates" },
        icon: "kanban",
        routeId: "Recruit.Pipeline.Route",
      },
      {
        label: "items.teamActivity",
        icon: "monitoring",
        routeId: "Recruit.TeamActivity.Route",
      },
      {
        label: "items.interviews",
        icon: "event",
        routeId: "Recruit.Interviews.Route",
      },
      {
        label: "items.placements",
        icon: "handshake",
        routeId: "Recruit.Placements.Route",
      },
      {
        label: "items.commissions",
        access: { resource: "commissions" },
        icon: "payments",
        routeId: "Recruit.Commissions.Route",
      },
      {
        label: "items.messages",
        icon: "mail-filled",
        routeId: "Recruit.Messages.Route",
      },
    ],
  },
  {
    title: "groups.aiFeatures",
    items: [
      {
        label: "items.aiScreening",
        access: { resource: "candidates" },
        icon: "sparkle",
        routeId: "Recruit.AiScreening.Route",
      },
      {
        label: "items.automation",
        access: { resource: "settings" },
        icon: "automation",
        routeId: "Recruit.Automation.Route",
      },
    ],
  },
  {
    title: "groups.tools",
    items: [
      {
        label: "items.settings",
        access: { resource: "settings" },
        icon: "settings",
        routeId: "Recruit.Settings.Route",
      },
      {
        label: "items.auditLog",
        access: { resource: "audit", action: ["read"] },
        icon: "history",
        routeId: "Recruit.AuditLog.Route",
      },
      {
        label: "items.helpCenter",
        icon: "help",
        routeId: "Recruit.HelpCenter.Route",
      },
    ],
  },
];

export const SidenavConfiguration = { groups };
