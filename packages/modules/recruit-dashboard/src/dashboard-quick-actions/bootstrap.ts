import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { QuickActionsRenderer } from "@recruit/shared";
import { DashboardQuickActionsConfiguration } from "./dashboard-quick-actions.configuration";
import fallbackTranslation from "./dashboard-quick-actions.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.DashboardQuickActions.Configuration",
  type: "CONFIGURATION",
  value: DashboardQuickActionsConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.DashboardQuickActions.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

export const DASHBOARD_QUICK_ACTIONS_COMPONENT: ComponentDefinition = {
  id: "Recruit.DashboardQuickActions.Component",
  type: "COMPONENT",
  value: QuickActionsRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
  },
};
