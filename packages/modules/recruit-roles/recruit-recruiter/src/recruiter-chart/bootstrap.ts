import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { GraphRenderer } from "@recruit/shared";
import { RecruiterChartConfiguration } from "./recruiter-chart.configuration";
import { recruiterChartDatasource } from "./recruiter-chart.datasource";
import fallbackTranslation from "./recruiter-chart.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.Recruiter.DashboardChart.Configuration",
  type: "CONFIGURATION",
  value: RecruiterChartConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.Recruiter.DashboardChart.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.Recruiter.DashboardChart.Datasource",
  type: "DATASOURCE",
  value: recruiterChartDatasource,
};

export const RECRUITER_CHART_COMPONENT: ComponentDefinition = {
  id: "Recruit.Recruiter.DashboardChart.Component",
  type: "COMPONENT",
  value: GraphRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
