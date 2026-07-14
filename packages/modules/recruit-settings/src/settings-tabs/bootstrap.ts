import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { SettingsTabsComponent } from "./settings-tabs.component";
import { SettingsTabsConfiguration } from "./settings-tabs.configuration";
import fallbackTranslation from "./settings-tabs.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.SettingsTabs.Configuration",
  type: "CONFIGURATION",
  value: SettingsTabsConfiguration,
};

const TRANSLATION: ComponentDependency = {
  id: "Recruit.SettingsTabs.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

export const SETTINGS_TABS_COMPONENT: ComponentDefinition = {
  id: "Recruit.SettingsTabs.Component",
  type: "COMPONENT",
  value: SettingsTabsComponent,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
  },
};
