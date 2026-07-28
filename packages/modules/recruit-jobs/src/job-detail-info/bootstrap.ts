import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { JobDetailInfoComponent } from "./job-detail-info.component";
import { JobDetailInfoConfiguration } from "./job-detail-info.configuration";
import { jobDetailInfoDatasource } from "./job-detail-info.datasource";
import fallbackTranslation from "./job-detail-info.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.JobDetailInfo.Configuration",
  type: "CONFIGURATION",
  value: JobDetailInfoConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.JobDetailInfo.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.JobDetailInfo.Datasource",
  type: "DATASOURCE",
  value: jobDetailInfoDatasource,
};

export const JOB_DETAIL_INFO_COMPONENT: ComponentDefinition = {
  id: "Recruit.JobDetailInfo.Component",
  type: "COMPONENT",
  value: JobDetailInfoComponent,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
