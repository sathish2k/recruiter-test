import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { MessageAlertRenderer } from "@recruit/shared";
import { DashboardInsightConfiguration } from "./dashboard-insight.configuration";
import { dashboardInsightDatasource } from "./dashboard-insight.datasource";
import fallbackTranslation from "./dashboard-insight.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.DashboardInsight.Configuration",
  type: "CONFIGURATION",
  value: DashboardInsightConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.DashboardInsight.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.DashboardInsight.Datasource",
  type: "DATASOURCE",
  value: dashboardInsightDatasource,
};

export const DASHBOARD_INSIGHT_COMPONENT: ComponentDefinition = {
  id: "Recruit.DashboardInsight.Component",
  type: "COMPONENT",
  value: MessageAlertRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
