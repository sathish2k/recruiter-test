import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { QuickActionsRenderer } from "@recruit/shared";
import { ClientQuickActionsConfiguration } from "./client-quick-actions.configuration";
import fallbackTranslation from "./client-quick-actions.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.Client.DashboardQuickActions.Configuration",
  type: "CONFIGURATION",
  value: ClientQuickActionsConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.Client.DashboardQuickActions.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

export const CLIENT_QUICK_ACTIONS_COMPONENT: ComponentDefinition = {
  id: "Recruit.Client.DashboardQuickActions.Component",
  type: "COMPONENT",
  value: QuickActionsRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
  },
};
