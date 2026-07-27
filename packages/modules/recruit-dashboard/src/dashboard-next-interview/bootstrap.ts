import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { CardRenderer } from "@recruit/shared";
import { DashboardNextInterviewConfiguration } from "./dashboard-next-interview.configuration";
import { dashboardNextInterviewDatasource } from "./dashboard-next-interview.datasource";
import fallbackTranslation from "./dashboard-next-interview.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.DashboardNextInterview.Configuration",
  type: "CONFIGURATION",
  value: DashboardNextInterviewConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.DashboardNextInterview.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.DashboardNextInterview.Datasource",
  type: "DATASOURCE",
  value: dashboardNextInterviewDatasource,
};

export const DASHBOARD_NEXT_INTERVIEW_COMPONENT: ComponentDefinition = {
  id: "Recruit.DashboardNextInterview.Component",
  type: "COMPONENT",
  value: CardRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
