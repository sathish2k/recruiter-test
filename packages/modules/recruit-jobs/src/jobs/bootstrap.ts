import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { JobsComponent } from "./jobs.component";
import { JobsConfiguration } from "./jobs.configuration";
import { jobsDatasource } from "./jobs.datasource";
import fallbackTranslation from "./jobs.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.Jobs.Configuration",
  type: "CONFIGURATION",
  value: JobsConfiguration,
};

const TRANSLATION: ComponentDependency = {
  id: "Recruit.Jobs.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

const DATASOURCE: ComponentDependency = {
  id: "Recruit.Jobs.Datasource",
  type: "DATASOURCE",
  value: jobsDatasource,
};

export const JOBS_COMPONENT: ComponentDefinition = {
  id: "Recruit.Jobs.Component",
  type: "COMPONENT",
  value: JobsComponent,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
