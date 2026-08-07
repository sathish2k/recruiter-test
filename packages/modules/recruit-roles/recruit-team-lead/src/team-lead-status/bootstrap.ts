import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { StatusChipsRenderer } from "@recruit/shared";
import { TeamLeadStatusConfiguration } from "./team-lead-status.configuration";
import { teamLeadStatusDatasource } from "./team-lead-status.datasource";
import fallbackTranslation from "./team-lead-status.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.TeamLead.DashboardStatus.Configuration",
  type: "CONFIGURATION",
  value: TeamLeadStatusConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.TeamLead.DashboardStatus.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.TeamLead.DashboardStatus.Datasource",
  type: "DATASOURCE",
  value: teamLeadStatusDatasource,
};

export const TEAM_LEAD_STATUS_COMPONENT: ComponentDefinition = {
  id: "Recruit.TeamLead.DashboardStatus.Component",
  type: "COMPONENT",
  value: StatusChipsRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
