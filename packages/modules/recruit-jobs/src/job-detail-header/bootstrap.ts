import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { JobDetailHeaderComponent } from "./job-detail-header.component";
import { JobDetailHeaderConfiguration } from "./job-detail-header.configuration";
import { jobDetailHeaderDatasource } from "./job-detail-header.datasource";
import fallbackTranslation from "./job-detail-header.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.JobDetailHeader.Configuration",
  type: "CONFIGURATION",
  value: JobDetailHeaderConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.JobDetailHeader.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.JobDetailHeader.Datasource",
  type: "DATASOURCE",
  value: jobDetailHeaderDatasource,
};

export const JOB_DETAIL_HEADER_COMPONENT: ComponentDefinition = {
  id: "Recruit.JobDetailHeader.Component",
  type: "COMPONENT",
  value: JobDetailHeaderComponent,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
