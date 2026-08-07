import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { GraphRenderer } from "@recruit/shared";
import { OwnerChartConfiguration } from "./owner-chart.configuration";
import { ownerChartDatasource } from "./owner-chart.datasource";
import fallbackTranslation from "./owner-chart.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.Owner.DashboardChart.Configuration",
  type: "CONFIGURATION",
  value: OwnerChartConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.Owner.DashboardChart.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.Owner.DashboardChart.Datasource",
  type: "DATASOURCE",
  value: ownerChartDatasource,
};

export const OWNER_CHART_COMPONENT: ComponentDefinition = {
  id: "Recruit.Owner.DashboardChart.Component",
  type: "COMPONENT",
  value: GraphRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
