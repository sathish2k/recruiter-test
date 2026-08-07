import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { GraphRenderer } from "@recruit/shared";
import { HiringManagerChartConfiguration } from "./hiring-manager-chart.configuration";
import { hiringManagerChartDatasource } from "./hiring-manager-chart.datasource";
import fallbackTranslation from "./hiring-manager-chart.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.HiringManager.DashboardChart.Configuration",
  type: "CONFIGURATION",
  value: HiringManagerChartConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.HiringManager.DashboardChart.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.HiringManager.DashboardChart.Datasource",
  type: "DATASOURCE",
  value: hiringManagerChartDatasource,
};

export const HIRING_MANAGER_CHART_COMPONENT: ComponentDefinition = {
  id: "Recruit.HiringManager.DashboardChart.Component",
  type: "COMPONENT",
  value: GraphRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
