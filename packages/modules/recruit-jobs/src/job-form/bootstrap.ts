import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { JobFormComponent } from "./job-form.component";
import { JobFormConfiguration } from "./job-form.configuration";
import { jobFormDatasource } from "./job-form.datasource";
import fallbackTranslation from "./job-form.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.JobForm.Configuration",
  type: "CONFIGURATION",
  value: JobFormConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.JobForm.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.JobForm.Datasource",
  type: "DATASOURCE",
  value: jobFormDatasource,
};

export const JOB_FORM_COMPONENT: ComponentDefinition = {
  id: "Recruit.JobForm.Component",
  type: "COMPONENT",
  value: JobFormComponent,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
