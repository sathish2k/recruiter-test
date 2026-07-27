import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { StatCardRenderer } from "@recruit/shared";
import { DashboardStatsConfiguration } from "./dashboard-stats.configuration";
import { dashboardStatsDatasource } from "./dashboard-stats.datasource";
import fallbackTranslation from "./dashboard-stats.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.DashboardStats.Configuration",
  type: "CONFIGURATION",
  value: DashboardStatsConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.DashboardStats.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.DashboardStats.Datasource",
  type: "DATASOURCE",
  value: dashboardStatsDatasource,
};

export const DASHBOARD_STATS_COMPONENT: ComponentDefinition = {
  id: "Recruit.DashboardStats.Component",
  type: "COMPONENT",
  value: StatCardRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
