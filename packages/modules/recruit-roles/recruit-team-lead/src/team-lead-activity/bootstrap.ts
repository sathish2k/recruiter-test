import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { SideListRenderer } from "@recruit/shared";
import { TeamLeadActivityConfiguration } from "./team-lead-activity.configuration";
import { teamleadActivityDatasource } from "./team-lead-activity.datasource";
import fallbackTranslation from "./team-lead-activity.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.TeamLead.DashboardActivity.Configuration",
  type: "CONFIGURATION",
  value: TeamLeadActivityConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.TeamLead.DashboardActivity.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.TeamLead.DashboardActivity.Datasource",
  type: "DATASOURCE",
  value: teamleadActivityDatasource,
};

export const TEAM_LEAD_ACTIVITY_COMPONENT: ComponentDefinition = {
  id: "Recruit.TeamLead.DashboardActivity.Component",
  type: "COMPONENT",
  value: SideListRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
