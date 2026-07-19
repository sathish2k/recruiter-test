import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { HelpCenterComponent } from "./help-center.component";
import { HelpCenterConfiguration } from "./help-center.configuration";
import fallbackTranslation from "./help-center.translations.json";

const HELP_CENTER_CONFIGURATION: ComponentDependency = {
  id: "Recruit.HelpCenter.Configuration",
  type: "CONFIGURATION",
  value: HelpCenterConfiguration,
};

const HELP_CENTER_TRANSLATION: ComponentDependency = {
  id: "Recruit.HelpCenter.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

export const HELP_CENTER_COMPONENT: ComponentDefinition = {
  id: "Recruit.HelpCenter.Component",
  type: "COMPONENT",
  value: HelpCenterComponent,
  default: {
    configuration: HELP_CENTER_CONFIGURATION,
    translation: HELP_CENTER_TRANSLATION,
  },
};
