import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { OnboardingGetStartedComponent } from "./get-started.component";
import { GetStartedConfiguration } from "./get-started.configuration";
import { getStartedDatasource } from "./get-started.datasource";
import fallbackTranslation from "./get-started.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Onboarding.GetStarted.Configuration",
  type: "CONFIGURATION",
  value: GetStartedConfiguration,
};

const TRANSLATION: ComponentDependency = {
  id: "Onboarding.GetStarted.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

const DATASOURCE: ComponentDependency = {
  id: "Onboarding.GetStarted.Datasource",
  type: "DATASOURCE",
  value: getStartedDatasource,
};

export const GET_STARTED_COMPONENT: ComponentDefinition = {
  id: "Onboarding.GetStarted.Component",
  type: "COMPONENT",
  value: OnboardingGetStartedComponent,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
