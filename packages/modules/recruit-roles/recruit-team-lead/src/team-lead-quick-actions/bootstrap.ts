import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { QuickActionsRenderer } from "@recruit/shared";
import { TeamLeadQuickActionsConfiguration } from "./team-lead-quick-actions.configuration";
import fallbackTranslation from "./team-lead-quick-actions.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.TeamLead.DashboardQuickActions.Configuration",
  type: "CONFIGURATION",
  value: TeamLeadQuickActionsConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.TeamLead.DashboardQuickActions.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

export const TEAM_LEAD_QUICK_ACTIONS_COMPONENT: ComponentDefinition = {
  id: "Recruit.TeamLead.DashboardQuickActions.Component",
  type: "COMPONENT",
  value: QuickActionsRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
  },
};
