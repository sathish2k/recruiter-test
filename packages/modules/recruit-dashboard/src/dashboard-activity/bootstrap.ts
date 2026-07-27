import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { BarChartRenderer } from "@recruit/shared";
import { DashboardActivityConfiguration } from "./dashboard-activity.configuration";
import { dashboardActivityDatasource } from "./dashboard-activity.datasource";
import fallbackTranslation from "./dashboard-activity.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.DashboardActivity.Configuration",
  type: "CONFIGURATION",
  value: DashboardActivityConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.DashboardActivity.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.DashboardActivity.Datasource",
  type: "DATASOURCE",
  value: dashboardActivityDatasource,
};

export const DASHBOARD_ACTIVITY_COMPONENT: ComponentDefinition = {
  id: "Recruit.DashboardActivity.Component",
  type: "COMPONENT",
  value: BarChartRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
