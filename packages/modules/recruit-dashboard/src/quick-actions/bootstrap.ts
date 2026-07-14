import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { QuickActionsComponent } from "./quick-actions.component";
import fallbackTranslation from "./quick-actions.translations.json";

const QUICK_ACTIONS_CONFIGURATION: ComponentDependency = {
  id: "Recruit.QuickActions.Configuration",
  type: "CONFIGURATION",
  value: {
    title: "title",
    actions: [
      { icon: "add", label: "addJob", routeId: "Recruit.Jobs.Route" },
      { icon: "person-add", label: "invite" },
      {
        icon: "sparkle",
        label: "screen",
        routeId: "Recruit.AiScreening.Route",
      },
    ],
  },
};

const QUICK_ACTIONS_TRANSLATION: ComponentDependency = {
  id: "Recruit.QuickActions.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

export const QUICK_ACTIONS_COMPONENT: ComponentDefinition = {
  id: "Recruit.QuickActions.Component",
  type: "COMPONENT",
  value: QuickActionsComponent,
  default: {
    configuration: QUICK_ACTIONS_CONFIGURATION,
    translation: QUICK_ACTIONS_TRANSLATION,
  },
};
