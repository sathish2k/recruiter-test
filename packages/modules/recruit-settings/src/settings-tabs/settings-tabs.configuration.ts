import type { AccessRule } from "@recruit/sdk";

export interface SettingsTabItem {
  /** Translation key. */
  label: string;
  /** Route id this tab navigates to; also matched against currentRoute. */
  routeId: string;
  /** Icon key mapped to an MUI icon in the component. */
  icon: string;
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
    { label: "tabs.workspace", routeId: "Recruit.Settings.Route", icon: "workspace" },
    { label: "tabs.members", routeId: "Recruit.SettingsMembers.Route", icon: "members" },
    {
      label: "tabs.templates",
      routeId: "Recruit.EmailTemplates.Route",
      icon: "templates",
    },
    { label: "tabs.billing", routeId: "Recruit.SettingsBilling.Route", icon: "billing" },
    {
      label: "tabs.integrations",
      routeId: "Recruit.SettingsIntegrations.Route",
      icon: "integrations",
    },
    { label: "tabs.security", routeId: "Recruit.SettingsSecurity.Route", icon: "security" },
  ],
};
