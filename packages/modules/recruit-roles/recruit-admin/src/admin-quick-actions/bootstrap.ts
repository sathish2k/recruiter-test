import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { QuickActionsRenderer } from "@recruit/shared";
import { AdminQuickActionsConfiguration } from "./admin-quick-actions.configuration";
import fallbackTranslation from "./admin-quick-actions.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.Admin.DashboardQuickActions.Configuration",
  type: "CONFIGURATION",
  value: AdminQuickActionsConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.Admin.DashboardQuickActions.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

export const ADMIN_QUICK_ACTIONS_COMPONENT: ComponentDefinition = {
  id: "Recruit.Admin.DashboardQuickActions.Component",
  type: "COMPONENT",
  value: QuickActionsRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
  },
};
