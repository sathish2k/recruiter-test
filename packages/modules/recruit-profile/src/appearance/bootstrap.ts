import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { AppearanceComponent } from "./appearance.component";
import { AppearanceConfiguration } from "./appearance.configuration";
import fallbackTranslation from "./appearance.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.ProfileAppearance.Configuration",
  type: "CONFIGURATION",
  value: AppearanceConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.ProfileAppearance.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

export const PROFILE_APPEARANCE_COMPONENT: ComponentDefinition = {
  id: "Recruit.ProfileAppearance.Component",
  type: "COMPONENT",
  value: AppearanceComponent,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
  },
};
