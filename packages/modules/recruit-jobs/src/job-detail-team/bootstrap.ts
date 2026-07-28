import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { JobDetailTeamComponent } from "./job-detail-team.component";
import { JobDetailTeamConfiguration } from "./job-detail-team.configuration";
import { jobDetailTeamDatasource } from "./job-detail-team.datasource";
import fallbackTranslation from "./job-detail-team.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.JobDetailTeam.Configuration",
  type: "CONFIGURATION",
  value: JobDetailTeamConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.JobDetailTeam.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.JobDetailTeam.Datasource",
  type: "DATASOURCE",
  value: jobDetailTeamDatasource,
};

export const JOB_DETAIL_TEAM_COMPONENT: ComponentDefinition = {
  id: "Recruit.JobDetailTeam.Component",
  type: "COMPONENT",
  value: JobDetailTeamComponent,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
