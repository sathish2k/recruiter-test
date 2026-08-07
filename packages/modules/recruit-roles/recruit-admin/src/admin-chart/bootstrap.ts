import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { GraphRenderer } from "@recruit/shared";
import { AdminChartConfiguration } from "./admin-chart.configuration";
import { adminChartDatasource } from "./admin-chart.datasource";
import fallbackTranslation from "./admin-chart.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.Admin.DashboardChart.Configuration",
  type: "CONFIGURATION",
  value: AdminChartConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.Admin.DashboardChart.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.Admin.DashboardChart.Datasource",
  type: "DATASOURCE",
  value: adminChartDatasource,
};

export const ADMIN_CHART_COMPONENT: ComponentDefinition = {
  id: "Recruit.Admin.DashboardChart.Component",
  type: "COMPONENT",
  value: GraphRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
