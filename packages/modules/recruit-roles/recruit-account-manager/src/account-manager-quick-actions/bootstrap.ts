import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { QuickActionsRenderer } from "@recruit/shared";
import { AccountManagerQuickActionsConfiguration } from "./account-manager-quick-actions.configuration";
import fallbackTranslation from "./account-manager-quick-actions.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.AccountManager.DashboardQuickActions.Configuration",
  type: "CONFIGURATION",
  value: AccountManagerQuickActionsConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.AccountManager.DashboardQuickActions.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

export const ACCOUNT_MANAGER_QUICK_ACTIONS_COMPONENT: ComponentDefinition = {
  id: "Recruit.AccountManager.DashboardQuickActions.Component",
  type: "COMPONENT",
  value: QuickActionsRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
  },
};
