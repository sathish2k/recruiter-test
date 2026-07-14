import type { AccessRule } from "@recruit/sdk";

export interface SettingsTabItem {
  /** Translation key. */
  label: string;
  /** Route id this tab navigates to; also matched against currentRoute. */
  routeId: string;
  /** Stripped by the engine when the user can't access it (admin-only tabs). */
  access?: AccessRule;
}

export interface SettingsTabsConfiguration {
  title: string;
  tabs: SettingsTabItem[];
}

export const SettingsTabsConfiguration: SettingsTabsConfiguration = {
  title: "title",
  tabs: [
    { label: "tabs.profile", routeId: "Recruit.Profile.Route" },
    {
      label: "tabs.team",
      routeId: "Recruit.Settings.Route",
      access: { resource: "settings" },
    },
    {
      label: "tabs.templates",
      routeId: "Recruit.EmailTemplates.Route",
      access: { resource: "settings" },
    },
  ],
};
