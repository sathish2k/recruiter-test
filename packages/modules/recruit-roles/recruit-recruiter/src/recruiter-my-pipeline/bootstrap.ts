import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { ProgressCardRenderer } from "@recruit/shared";
import { RecruiterMyPipelineConfiguration } from "./recruiter-my-pipeline.configuration";
import { recruiterMyPipelineDatasource } from "./recruiter-my-pipeline.datasource";
import fallbackTranslation from "./recruiter-my-pipeline.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.Recruiter.DashboardMyPipeline.Configuration",
  type: "CONFIGURATION",
  value: RecruiterMyPipelineConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.Recruiter.DashboardMyPipeline.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.Recruiter.DashboardMyPipeline.Datasource",
  type: "DATASOURCE",
  value: recruiterMyPipelineDatasource,
};

export const RECRUITER_MY_PIPELINE_COMPONENT: ComponentDefinition = {
  id: "Recruit.Recruiter.DashboardMyPipeline.Component",
  type: "COMPONENT",
  value: ProgressCardRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
