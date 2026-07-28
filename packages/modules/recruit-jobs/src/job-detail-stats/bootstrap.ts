import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { StatCardRenderer } from "@recruit/shared";
import { JobDetailStatsConfiguration } from "./job-detail-stats.configuration";
import { jobDetailStatsDatasource } from "./job-detail-stats.datasource";
import fallbackTranslation from "./job-detail-stats.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.JobDetailStats.Configuration",
  type: "CONFIGURATION",
  value: JobDetailStatsConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.JobDetailStats.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.JobDetailStats.Datasource",
  type: "DATASOURCE",
  value: jobDetailStatsDatasource,
};

export const JOB_DETAIL_STATS_COMPONENT: ComponentDefinition = {
  id: "Recruit.JobDetailStats.Component",
  type: "COMPONENT",
  value: StatCardRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
