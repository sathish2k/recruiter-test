import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { GraphRenderer } from "@recruit/shared";
import { TeamLeadChartConfiguration } from "./team-lead-chart.configuration";
import { teamLeadChartDatasource } from "./team-lead-chart.datasource";
import fallbackTranslation from "./team-lead-chart.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.TeamLead.DashboardChart.Configuration",
  type: "CONFIGURATION",
  value: TeamLeadChartConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.TeamLead.DashboardChart.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.TeamLead.DashboardChart.Datasource",
  type: "DATASOURCE",
  value: teamLeadChartDatasource,
};

export const TEAM_LEAD_CHART_COMPONENT: ComponentDefinition = {
  id: "Recruit.TeamLead.DashboardChart.Component",
  type: "COMPONENT",
  value: GraphRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
