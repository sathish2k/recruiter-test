import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { StatCardRenderer } from "@recruit/shared";
import { TeamLeadKpisConfiguration } from "./team-lead-kpis.configuration";
import { teamLeadKpisDatasource } from "./team-lead-kpis.datasource";
import fallbackTranslation from "./team-lead-kpis.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.TeamLead.DashboardStats.Configuration",
  type: "CONFIGURATION",
  value: TeamLeadKpisConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.TeamLead.DashboardStats.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.TeamLead.DashboardStats.Datasource",
  type: "DATASOURCE",
  value: teamLeadKpisDatasource,
};

export const TEAM_LEAD_KPIS_COMPONENT: ComponentDefinition = {
  id: "Recruit.TeamLead.DashboardStats.Component",
  type: "COMPONENT",
  value: StatCardRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
