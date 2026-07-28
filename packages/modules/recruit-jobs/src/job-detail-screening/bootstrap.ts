import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { JobDetailScreeningComponent } from "./job-detail-screening.component";
import { jobDetailScreeningDatasource } from "./job-detail-screening.datasource";
import fallbackTranslation from "./job-detail-screening.translations.json";

const TRANSLATION: ComponentDependency = {
  id: "Recruit.JobDetailScreening.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.JobDetailScreening.Datasource",
  type: "DATASOURCE",
  value: jobDetailScreeningDatasource,
};

export const JOB_DETAIL_SCREENING_COMPONENT: ComponentDefinition = {
  id: "Recruit.JobDetailScreening.Component",
  type: "COMPONENT",
  value: JobDetailScreeningComponent,
  default: {
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
