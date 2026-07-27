import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { ListRenderer } from "@recruit/shared";
import { DashboardPrioritiesConfiguration } from "./dashboard-priorities.configuration";
import { dashboardPrioritiesDatasource } from "./dashboard-priorities.datasource";
import fallbackTranslation from "./dashboard-priorities.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.DashboardPriorities.Configuration",
  type: "CONFIGURATION",
  value: DashboardPrioritiesConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.DashboardPriorities.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.DashboardPriorities.Datasource",
  type: "DATASOURCE",
  value: dashboardPrioritiesDatasource,
};

export const DASHBOARD_PRIORITIES_COMPONENT: ComponentDefinition = {
  id: "Recruit.DashboardPriorities.Component",
  type: "COMPONENT",
  value: ListRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
