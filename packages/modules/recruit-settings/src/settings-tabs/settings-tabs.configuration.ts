import type { TabNavConfiguration } from "@recruit/shared";

export const SettingsTabsConfiguration: TabNavConfiguration = {
  orientation: "vertical",
  tabs: [
    { label: "tabs.general", icon: "corporate-fare", routeId: "Recruit.Settings.Route" },
    { label: "tabs.branding", icon: "palette", routeId: "Recruit.SettingsBranding.Route" },
    {
      label: "tabs.localization",
      icon: "translate",
      routeId: "Recruit.SettingsLocalization.Route",
    },
    { label: "tabs.security", icon: "shield", routeId: "Recruit.SettingsSecurity.Route" },
    { label: "tabs.email", icon: "mail", routeId: "Recruit.EmailTemplates.Route" },
    { label: "tabs.integrations", icon: "hub", routeId: "Recruit.SettingsIntegrations.Route" },
    { label: "tabs.billing", icon: "credit-card", routeId: "Recruit.SettingsBilling.Route" },
    {
      label: "tabs.auditLog",
      icon: "history",
      routeId: "Recruit.SettingsAuditLog.Route",
      access: { resource: "audit" },
    },
  ],
};
