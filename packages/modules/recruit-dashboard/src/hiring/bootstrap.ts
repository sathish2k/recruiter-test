import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { HiringComponent } from "./hiring.component";
import { HiringConfiguration } from "./hiring.configuration";
import { hiringDatasource } from "./hiring.datasource";
import fallbackTranslation from "./hiring.translations.json";

const HIRING_CONFIGURATION: ComponentDependency = {
  id: "Recruit.Hiring.Configuration",
  type: "CONFIGURATION",
  value: HiringConfiguration,
};

const HIRING_TRANSLATION: ComponentDependency = {
  id: "Recruit.Hiring.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

const HIRING_DATASOURCE: ComponentDependency = {
  id: "Recruit.Hiring.Datasource",
  type: "DATASOURCE",
  value: hiringDatasource,
};

export const HIRING_COMPONENT: ComponentDefinition = {
  id: "Recruit.Hiring.Component",
  type: "COMPONENT",
  value: HiringComponent,
  default: {
    configuration: HIRING_CONFIGURATION,
    translation: HIRING_TRANSLATION,
    datasource: HIRING_DATASOURCE,
  },
};
