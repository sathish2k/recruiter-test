import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { TodayWorkRenderer } from "@recruit/shared";
import { TeamLeadTodayWorkConfiguration } from "./team-lead-today-work.configuration";
import { teamLeadTodayWorkDatasource } from "./team-lead-today-work.datasource";
import fallbackTranslation from "./team-lead-today-work.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.TeamLead.DashboardTodayWork.Configuration",
  type: "CONFIGURATION",
  value: TeamLeadTodayWorkConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.TeamLead.DashboardTodayWork.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.TeamLead.DashboardTodayWork.Datasource",
  type: "DATASOURCE",
  value: teamLeadTodayWorkDatasource,
};

export const TEAM_LEAD_TODAY_WORK_COMPONENT: ComponentDefinition = {
  id: "Recruit.TeamLead.DashboardTodayWork.Component",
  type: "COMPONENT",
  value: TodayWorkRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
