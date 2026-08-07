import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { GraphRenderer } from "@recruit/shared";
import { AccountManagerChartConfiguration } from "./account-manager-chart.configuration";
import { accountManagerChartDatasource } from "./account-manager-chart.datasource";
import fallbackTranslation from "./account-manager-chart.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.AccountManager.DashboardChart.Configuration",
  type: "CONFIGURATION",
  value: AccountManagerChartConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.AccountManager.DashboardChart.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.AccountManager.DashboardChart.Datasource",
  type: "DATASOURCE",
  value: accountManagerChartDatasource,
};

export const ACCOUNT_MANAGER_CHART_COMPONENT: ComponentDefinition = {
  id: "Recruit.AccountManager.DashboardChart.Component",
  type: "COMPONENT",
  value: GraphRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
