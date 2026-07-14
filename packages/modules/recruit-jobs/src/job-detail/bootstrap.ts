import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { JobDetailComponent } from "./job-detail.component";
import { JobDetailConfiguration } from "./job-detail.configuration";
import { jobDetailDatasource } from "./job-detail.datasource";
import fallbackTranslation from "./job-detail.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.JobDetail.Configuration",
  type: "CONFIGURATION",
  value: JobDetailConfiguration,
};

const TRANSLATION: ComponentDependency = {
  id: "Recruit.JobDetail.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

const DATASOURCE: ComponentDependency = {
  id: "Recruit.JobDetail.Datasource",
  type: "DATASOURCE",
  value: jobDetailDatasource,
};

export const JOB_DETAIL_COMPONENT: ComponentDefinition = {
  id: "Recruit.JobDetail.Component",
  type: "COMPONENT",
  value: JobDetailComponent,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
