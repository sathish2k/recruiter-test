import type { AccessRule } from "@recruit/sdk";

export interface SettingsTabItem {
  label: string;
  routeId: string;
  icon: string;
  badge?: string;
  access?: AccessRule;
}

export interface SettingsTabsConfiguration {
  title: string;
  subtitle: string;
  tabs: SettingsTabItem[];
}

export const SettingsTabsConfiguration: SettingsTabsConfiguration = {
  title: "title",
  subtitle: "subtitle",
  tabs: [
    { label: "tabs.workspace", routeId: "Recruit.Settings.Route", icon: "workspace" },
    { label: "tabs.members", routeId: "Recruit.SettingsMembers.Route", icon: "members" },
    {
      label: "tabs.roles",
      routeId: "Recruit.SettingsRoles.Route",
      icon: "roles",
      access: { resource: "settings" },
    },
    {
      label: "tabs.templates",
      routeId: "Recruit.EmailTemplates.Route",
      icon: "templates",
    },
    {
      label: "tabs.integrations",
      routeId: "Recruit.SettingsIntegrations.Route",
      icon: "integrations",
    },
    { label: "tabs.billing", routeId: "Recruit.SettingsBilling.Route", icon: "billing" },
    { label: "tabs.security", routeId: "Recruit.SettingsSecurity.Route", icon: "security" },
    {
      label: "tabs.auditLog",
      routeId: "Recruit.SettingsAuditLog.Route",
      icon: "auditLog",
      badge: "badges.enterprise",
    },
  ],
};
