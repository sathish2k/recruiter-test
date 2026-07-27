import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { StageFunnelRenderer } from "@recruit/shared";
import { DashboardPipelineConfiguration } from "./dashboard-pipeline.configuration";
import { dashboardPipelineDatasource } from "./dashboard-pipeline.datasource";
import fallbackTranslation from "./dashboard-pipeline.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.DashboardPipeline.Configuration",
  type: "CONFIGURATION",
  value: DashboardPipelineConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.DashboardPipeline.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.DashboardPipeline.Datasource",
  type: "DATASOURCE",
  value: dashboardPipelineDatasource,
};

export const DASHBOARD_PIPELINE_COMPONENT: ComponentDefinition = {
  id: "Recruit.DashboardPipeline.Component",
  type: "COMPONENT",
  value: StageFunnelRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
