import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { AiInsightRenderer } from "@recruit/shared";
import { TeamLeadAiConfiguration } from "./team-lead-ai.configuration";
import { teamLeadAiDatasource } from "./team-lead-ai.datasource";
import fallbackTranslation from "./team-lead-ai.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.TeamLead.DashboardAi.Configuration",
  type: "CONFIGURATION",
  value: TeamLeadAiConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.TeamLead.DashboardAi.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.TeamLead.DashboardAi.Datasource",
  type: "DATASOURCE",
  value: teamLeadAiDatasource,
};

export const TEAM_LEAD_AI_COMPONENT: ComponentDefinition = {
  id: "Recruit.TeamLead.DashboardAi.Component",
  type: "COMPONENT",
  value: AiInsightRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
