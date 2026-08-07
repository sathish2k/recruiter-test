import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { QuickActionsRenderer } from "@recruit/shared";
import { HiringManagerQuickActionsConfiguration } from "./hiring-manager-quick-actions.configuration";
import fallbackTranslation from "./hiring-manager-quick-actions.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.HiringManager.DashboardQuickActions.Configuration",
  type: "CONFIGURATION",
  value: HiringManagerQuickActionsConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.HiringManager.DashboardQuickActions.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

export const HIRING_MANAGER_QUICK_ACTIONS_COMPONENT: ComponentDefinition = {
  id: "Recruit.HiringManager.DashboardQuickActions.Component",
  type: "COMPONENT",
  value: QuickActionsRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
  },
};
