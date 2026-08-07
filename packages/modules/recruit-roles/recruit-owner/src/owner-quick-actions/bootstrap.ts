import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { QuickActionsRenderer } from "@recruit/shared";
import { OwnerQuickActionsConfiguration } from "./owner-quick-actions.configuration";
import fallbackTranslation from "./owner-quick-actions.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.Owner.DashboardQuickActions.Configuration",
  type: "CONFIGURATION",
  value: OwnerQuickActionsConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.Owner.DashboardQuickActions.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

export const OWNER_QUICK_ACTIONS_COMPONENT: ComponentDefinition = {
  id: "Recruit.Owner.DashboardQuickActions.Component",
  type: "COMPONENT",
  value: QuickActionsRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
  },
};
