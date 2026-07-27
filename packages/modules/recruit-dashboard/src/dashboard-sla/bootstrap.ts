import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { CardRenderer } from "@recruit/shared";
import { DashboardSlaConfiguration } from "./dashboard-sla.configuration";
import { dashboardSlaDatasource } from "./dashboard-sla.datasource";
import fallbackTranslation from "./dashboard-sla.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.DashboardSla.Configuration",
  type: "CONFIGURATION",
  value: DashboardSlaConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.DashboardSla.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.DashboardSla.Datasource",
  type: "DATASOURCE",
  value: dashboardSlaDatasource,
};

export const DASHBOARD_SLA_COMPONENT: ComponentDefinition = {
  id: "Recruit.DashboardSla.Component",
  type: "COMPONENT",
  value: CardRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
