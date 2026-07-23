import type { TabNavConfiguration } from "@recruit/shared";

export const SettingsTabsConfiguration: TabNavConfiguration = {
  title: "title",
  subtitle: "subtitle",
  tabs: [
    { label: "tabs.workspace", routeId: "Recruit.Settings.Route" },
    { label: "tabs.members", routeId: "Recruit.SettingsMembers.Route" },
    {
      label: "tabs.roles",
      routeId: "Recruit.SettingsRoles.Route",
      access: { resource: "settings" },
    },
    {
      label: "tabs.templates",
      routeId: "Recruit.EmailTemplates.Route",
    },
    {
      label: "tabs.integrations",
      routeId: "Recruit.SettingsIntegrations.Route",
    },
    { label: "tabs.billing", routeId: "Recruit.SettingsBilling.Route" },
    { label: "tabs.security", routeId: "Recruit.SettingsSecurity.Route" },
    {
      label: "tabs.auditLog",
      routeId: "Recruit.SettingsAuditLog.Route",
      badge: "badges.enterprise",
    },
  ],
};
