import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { ProgressCardRenderer } from "@recruit/shared";
import { TeamLeadCoachingConfiguration } from "./team-lead-coaching.configuration";
import { teamLeadCoachingDatasource } from "./team-lead-coaching.datasource";
import fallbackTranslation from "./team-lead-coaching.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.TeamLead.DashboardCoaching.Configuration",
  type: "CONFIGURATION",
  value: TeamLeadCoachingConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.TeamLead.DashboardCoaching.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.TeamLead.DashboardCoaching.Datasource",
  type: "DATASOURCE",
  value: teamLeadCoachingDatasource,
};

export const TEAM_LEAD_COACHING_COMPONENT: ComponentDefinition = {
  id: "Recruit.TeamLead.DashboardCoaching.Component",
  type: "COMPONENT",
  value: ProgressCardRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
