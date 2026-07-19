import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { AppbarComponent } from "./appbar.component";
import { AppbarConfiguration } from "./appbar.configuration";
import fallbackTranslation from "./appbar.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.Appbar.Configuration",
  type: "CONFIGURATION",
  value: AppbarConfiguration,
};

const TRANSLATION: ComponentDependency = {
  id: "Recruit.Appbar.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

export const APPBAR_COMPONENT: ComponentDefinition = {
  id: "Recruit.Appbar.Component",
  type: "COMPONENT",
  value: AppbarComponent,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
  },
};
