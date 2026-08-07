import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { QuickActionsRenderer } from "@recruit/shared";
import { SourcerQuickActionsConfiguration } from "./sourcer-quick-actions.configuration";
import fallbackTranslation from "./sourcer-quick-actions.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.Sourcer.DashboardQuickActions.Configuration",
  type: "CONFIGURATION",
  value: SourcerQuickActionsConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.Sourcer.DashboardQuickActions.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

export const SOURCER_QUICK_ACTIONS_COMPONENT: ComponentDefinition = {
  id: "Recruit.Sourcer.DashboardQuickActions.Component",
  type: "COMPONENT",
  value: QuickActionsRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
  },
};
