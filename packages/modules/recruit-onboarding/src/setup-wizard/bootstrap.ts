import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { OnboardingSetupWizardComponent } from "./setup-wizard.component";
import { SetupWizardConfiguration } from "./setup-wizard.configuration";
import { setupWizardDatasource } from "./setup-wizard.datasource";
import fallbackTranslation from "./setup-wizard.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Onboarding.SetupWizard.Configuration",
  type: "CONFIGURATION",
  value: SetupWizardConfiguration,
};

const TRANSLATION: ComponentDependency = {
  id: "Onboarding.SetupWizard.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

const DATASOURCE: ComponentDependency = {
  id: "Onboarding.SetupWizard.Datasource",
  type: "DATASOURCE",
  value: setupWizardDatasource,
};

export const SETUP_WIZARD_COMPONENT: ComponentDefinition = {
  id: "Onboarding.SetupWizard.Component",
  type: "COMPONENT",
  value: OnboardingSetupWizardComponent,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
