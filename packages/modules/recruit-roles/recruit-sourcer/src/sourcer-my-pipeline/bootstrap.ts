import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { ProgressCardRenderer } from "@recruit/shared";
import { SourcerMyPipelineConfiguration } from "./sourcer-my-pipeline.configuration";
import { sourcerMyPipelineDatasource } from "./sourcer-my-pipeline.datasource";
import fallbackTranslation from "./sourcer-my-pipeline.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.Sourcer.DashboardMyPipeline.Configuration",
  type: "CONFIGURATION",
  value: SourcerMyPipelineConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.Sourcer.DashboardMyPipeline.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.Sourcer.DashboardMyPipeline.Datasource",
  type: "DATASOURCE",
  value: sourcerMyPipelineDatasource,
};

export const SOURCER_MY_PIPELINE_COMPONENT: ComponentDefinition = {
  id: "Recruit.Sourcer.DashboardMyPipeline.Component",
  type: "COMPONENT",
  value: ProgressCardRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
