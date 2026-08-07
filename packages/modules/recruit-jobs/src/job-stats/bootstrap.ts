import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { StatCardRenderer } from "@recruit/shared";
import { JobStatsConfiguration } from "./job-stats.configuration";
import { jobStatsDatasource } from "./job-stats.datasource";
import fallbackTranslation from "./job-stats.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.JobStats.Configuration",
  type: "CONFIGURATION",
  value: JobStatsConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.JobStats.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.JobStats.Datasource",
  type: "DATASOURCE",
  value: jobStatsDatasource,
};

export const JOB_STATS_COMPONENT: ComponentDefinition = {
  id: "Recruit.JobStats.Component",
  type: "COMPONENT",
  value: StatCardRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
