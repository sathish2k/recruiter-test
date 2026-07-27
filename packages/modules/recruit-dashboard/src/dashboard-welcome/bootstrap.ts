import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { DashboardWelcomeComponent } from "./dashboard-welcome.component";
import { DashboardWelcomeConfiguration } from "./dashboard-welcome.configuration";
import { dashboardSummaryDatasource } from "./dashboard-welcome.datasource";
import fallbackTranslation from "./dashboard-welcome.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.DashboardWelcome.Configuration",
  type: "CONFIGURATION",
  value: DashboardWelcomeConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.DashboardWelcome.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.DashboardWelcome.Datasource",
  type: "DATASOURCE",
  value: dashboardSummaryDatasource,
};

export const DASHBOARD_WELCOME_COMPONENT: ComponentDefinition = {
  id: "Recruit.DashboardWelcome.Component",
  type: "COMPONENT",
  value: DashboardWelcomeComponent,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
