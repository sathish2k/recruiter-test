import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { GraphRenderer } from "@recruit/shared";
import { ClientChartConfiguration } from "./client-chart.configuration";
import { clientChartDatasource } from "./client-chart.datasource";
import fallbackTranslation from "./client-chart.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.Client.DashboardChart.Configuration",
  type: "CONFIGURATION",
  value: ClientChartConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.Client.DashboardChart.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.Client.DashboardChart.Datasource",
  type: "DATASOURCE",
  value: clientChartDatasource,
};

export const CLIENT_CHART_COMPONENT: ComponentDefinition = {
  id: "Recruit.Client.DashboardChart.Component",
  type: "COMPONENT",
  value: GraphRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
