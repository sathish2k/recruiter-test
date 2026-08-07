import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { QuickActionsRenderer } from "@recruit/shared";
import { RecruiterQuickActionsConfiguration } from "./recruiter-quick-actions.configuration";
import fallbackTranslation from "./recruiter-quick-actions.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.Recruiter.DashboardQuickActions.Configuration",
  type: "CONFIGURATION",
  value: RecruiterQuickActionsConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.Recruiter.DashboardQuickActions.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

export const RECRUITER_QUICK_ACTIONS_COMPONENT: ComponentDefinition = {
  id: "Recruit.Recruiter.DashboardQuickActions.Component",
  type: "COMPONENT",
  value: QuickActionsRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
  },
};
