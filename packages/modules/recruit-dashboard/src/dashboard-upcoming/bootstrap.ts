import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { ListRenderer } from "@recruit/shared";
import { DashboardUpcomingConfiguration } from "./dashboard-upcoming.configuration";
import { dashboardUpcomingDatasource } from "./dashboard-upcoming.datasource";
import fallbackTranslation from "./dashboard-upcoming.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.DashboardUpcoming.Configuration",
  type: "CONFIGURATION",
  value: DashboardUpcomingConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.DashboardUpcoming.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.DashboardUpcoming.Datasource",
  type: "DATASOURCE",
  value: dashboardUpcomingDatasource,
};

export const DASHBOARD_UPCOMING_COMPONENT: ComponentDefinition = {
  id: "Recruit.DashboardUpcoming.Component",
  type: "COMPONENT",
  value: ListRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
