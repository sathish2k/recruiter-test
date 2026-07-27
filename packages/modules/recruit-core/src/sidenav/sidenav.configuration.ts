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

/** The gradient promo pinned to the bottom of the rail. Omit to hide it. */
export interface SidenavPromo {
  icon: string;
  title: string;
  body: string;
  cta: { label: string; routeId: string };
  secondary?: { label: string; routeId: string };
  access?: AccessRule;
}

export interface SidenavConfig {
  groups: SidenavGroup[];
  promo?: SidenavPromo;
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
    ],
  },
  {
    title: "groups.recruitment",
    items: [
      {
        label: "items.clients",
        access: { resource: "clients" },
        icon: "domain",
        routeId: "Recruit.Clients.Route",
      },
      {
        label: "items.contacts",
        access: { resource: "contacts" },
        icon: "contacts",
        routeId: "Recruit.Contacts.Route",
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
        label: "items.interviews",
        access: { resource: "interviews" },
        icon: "event",
        routeId: "Recruit.Interviews.Route",
      },
      {
        label: "items.placements",
        icon: "handshake",
        routeId: "Recruit.Placements.Route",
      },
    ],
  },
  {
    title: "groups.insights",
    items: [
      {
        label: "items.analytics",
        icon: "insights",
        routeId: "Recruit.Analytics.Route",
      },
      {
        label: "items.commissions",
        access: { resource: "commissions" },
        icon: "payments",
        routeId: "Recruit.Commissions.Route",
      },
      {
        label: "items.teamActivity",
        icon: "monitoring",
        routeId: "Recruit.TeamActivity.Route",
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
        label: "items.integrations",
        access: { resource: "settings" },
        icon: "hub",
        routeId: "Recruit.SettingsIntegrations.Route",
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

export const SidenavConfiguration: SidenavConfig = {
  groups,
  promo: {
    icon: "sparkle",
    title: "promo.title",
    body: "promo.body",
    cta: { label: "promo.cta", routeId: "Recruit.SettingsBilling.Route" },
    secondary: { label: "promo.secondary", routeId: "Recruit.SettingsBilling.Route" },
    access: { resource: "settings" },
  },
};
