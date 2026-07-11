import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { WelcomeComponent } from "./welcome.component";
import { WelcomeConfiguration } from "./welcome.configuration";
import { welcomeDatasource } from "./welcome.datasource";
import fallbackTranslation from "./welcome.translations.json";

const WELCOME_CONFIGURATION: ComponentDependency = {
  id: "Recruit.Welcome.Configuration",
  type: "CONFIGURATION",
  value: WelcomeConfiguration,
};

const WELCOME_TRANSLATION: ComponentDependency = {
  id: "Recruit.Welcome.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

const WELCOME_DATASOURCE: ComponentDependency = {
  id: "Recruit.Welcome.Datasource",
  type: "DATASOURCE",
  value: welcomeDatasource,
};

export const WELCOME_COMPONENT: ComponentDefinition = {
  id: "Recruit.Welcome.Component",
  type: "COMPONENT",
  value: WelcomeComponent,
  default: {
    configuration: WELCOME_CONFIGURATION,
    translation: WELCOME_TRANSLATION,
    datasource: WELCOME_DATASOURCE,
  },
};
