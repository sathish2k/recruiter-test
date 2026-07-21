import type { AccessRule } from "@recruit/sdk";

export interface SettingsTabItem {
  /** Translation key for the pill label. */
  label: string;
  /** Route this pill navigates to; also matched against currentRoute. */
  routeId: string;
  /** Optional chip beside the label (translation key), e.g. `Enterprise`. */
  badge?: string;
  /** Stripped by the engine when the user can't access it. */
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
