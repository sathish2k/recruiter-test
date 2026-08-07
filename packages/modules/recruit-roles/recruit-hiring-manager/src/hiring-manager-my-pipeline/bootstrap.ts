import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { ProgressCardRenderer } from "@recruit/shared";
import { HiringManagerMyPipelineConfiguration } from "./hiring-manager-my-pipeline.configuration";
import { hiringManagerMyPipelineDatasource } from "./hiring-manager-my-pipeline.datasource";
import fallbackTranslation from "./hiring-manager-my-pipeline.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.HiringManager.DashboardMyPipeline.Configuration",
  type: "CONFIGURATION",
  value: HiringManagerMyPipelineConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.HiringManager.DashboardMyPipeline.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.HiringManager.DashboardMyPipeline.Datasource",
  type: "DATASOURCE",
  value: hiringManagerMyPipelineDatasource,
};

export const HIRING_MANAGER_MY_PIPELINE_COMPONENT: ComponentDefinition = {
  id: "Recruit.HiringManager.DashboardMyPipeline.Component",
  type: "COMPONENT",
  value: ProgressCardRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
