import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { TabNavRenderer } from "@recruit/shared";
import { ProfileTabsConfiguration } from "./profile-tabs.configuration";
import fallbackTranslation from "./profile-tabs.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.ProfileTabs.Configuration",
  type: "CONFIGURATION",
  value: ProfileTabsConfiguration,
};

const TRANSLATION: ComponentDependency = {
  id: "Recruit.ProfileTabs.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

export const PROFILE_TABS_COMPONENT: ComponentDefinition = {
  id: "Recruit.ProfileTabs.Component",
  type: "COMPONENT",
  value: TabNavRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
  },
};
