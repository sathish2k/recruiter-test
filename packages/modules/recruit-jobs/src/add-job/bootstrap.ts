import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { AddJobComponent } from "./add-job.component";
import { AddJobConfiguration } from "./add-job.configuration";
import { addJobDatasource } from "./add-job.datasource";
import fallbackTranslation from "./add-job.translations.json";

const ADD_JOB_CONFIGURATION: ComponentDependency = {
  id: "Recruit.AddJob.Configuration",
  type: "CONFIGURATION",
  value: AddJobConfiguration,
};

const ADD_JOB_TRANSLATION: ComponentDependency = {
  id: "Recruit.AddJob.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

const ADD_JOB_DATASOURCE: ComponentDependency = {
  id: "Recruit.AddJob.Datasource",
  type: "DATASOURCE",
  value: addJobDatasource,
};

export const ADD_JOB_COMPONENT: ComponentDefinition = {
  id: "Recruit.AddJob.Component",
  type: "COMPONENT",
  value: AddJobComponent,
  default: {
    configuration: ADD_JOB_CONFIGURATION,
    translation: ADD_JOB_TRANSLATION,
    datasource: ADD_JOB_DATASOURCE,
  },
};
