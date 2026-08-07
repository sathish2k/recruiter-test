import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { SideListRenderer } from "@recruit/shared";
import { TeamLeadSideConfiguration } from "./team-lead-side.configuration";
import { teamLeadSideDatasource } from "./team-lead-side.datasource";
import fallbackTranslation from "./team-lead-side.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.TeamLead.DashboardSide.Configuration",
  type: "CONFIGURATION",
  value: TeamLeadSideConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.TeamLead.DashboardSide.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.TeamLead.DashboardSide.Datasource",
  type: "DATASOURCE",
  value: teamLeadSideDatasource,
};

export const TEAM_LEAD_SIDE_COMPONENT: ComponentDefinition = {
  id: "Recruit.TeamLead.DashboardSide.Component",
  type: "COMPONENT",
  value: SideListRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
