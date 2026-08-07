import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { HealthCardRenderer } from "@recruit/shared";
import { TeamLeadTeamHealthConfiguration } from "./team-lead-team-health.configuration";
import { teamLeadTeamHealthDatasource } from "./team-lead-team-health.datasource";
import fallbackTranslation from "./team-lead-team-health.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.TeamLead.DashboardTeamHealth.Configuration",
  type: "CONFIGURATION",
  value: TeamLeadTeamHealthConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.TeamLead.DashboardTeamHealth.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.TeamLead.DashboardTeamHealth.Datasource",
  type: "DATASOURCE",
  value: teamLeadTeamHealthDatasource,
};

export const TEAM_LEAD_TEAM_HEALTH_COMPONENT: ComponentDefinition = {
  id: "Recruit.TeamLead.DashboardTeamHealth.Component",
  type: "COMPONENT",
  value: HealthCardRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
