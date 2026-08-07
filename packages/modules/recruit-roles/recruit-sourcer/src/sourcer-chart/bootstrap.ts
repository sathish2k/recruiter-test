import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { GraphRenderer } from "@recruit/shared";
import { SourcerChartConfiguration } from "./sourcer-chart.configuration";
import { sourcerChartDatasource } from "./sourcer-chart.datasource";
import fallbackTranslation from "./sourcer-chart.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.Sourcer.DashboardChart.Configuration",
  type: "CONFIGURATION",
  value: SourcerChartConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.Sourcer.DashboardChart.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.Sourcer.DashboardChart.Datasource",
  type: "DATASOURCE",
  value: sourcerChartDatasource,
};

export const SOURCER_CHART_COMPONENT: ComponentDefinition = {
  id: "Recruit.Sourcer.DashboardChart.Component",
  type: "COMPONENT",
  value: GraphRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
