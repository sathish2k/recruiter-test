import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { SideListRenderer } from "@recruit/shared";
import { TeamLeadRecentsConfiguration } from "./team-lead-recents.configuration";
import { teamLeadRecentsDatasource } from "./team-lead-recents.datasource";
import fallbackTranslation from "./team-lead-recents.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.TeamLead.DashboardRecents.Configuration",
  type: "CONFIGURATION",
  value: TeamLeadRecentsConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.TeamLead.DashboardRecents.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.TeamLead.DashboardRecents.Datasource",
  type: "DATASOURCE",
  value: teamLeadRecentsDatasource,
};

export const TEAM_LEAD_RECENTS_COMPONENT: ComponentDefinition = {
  id: "Recruit.TeamLead.DashboardRecents.Component",
  type: "COMPONENT",
  value: SideListRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
