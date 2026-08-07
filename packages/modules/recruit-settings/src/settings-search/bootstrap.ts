import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { SettingsSearchComponent } from "./settings-search.component";
import { SettingsSearchConfiguration } from "./settings-search.configuration";
import fallbackTranslation from "./settings-search.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.SettingsSearch.Configuration",
  type: "CONFIGURATION",
  value: SettingsSearchConfiguration,
};

const TRANSLATION: ComponentDependency = {
  id: "Recruit.SettingsSearch.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

export const SETTINGS_SEARCH_COMPONENT: ComponentDefinition = {
  id: "Recruit.SettingsSearch.Component",
  type: "COMPONENT",
  value: SettingsSearchComponent,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
  },
};
