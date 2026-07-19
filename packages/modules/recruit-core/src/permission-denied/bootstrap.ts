import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { PermissionDeniedComponent } from "./permission-denied.component";
import { PermissionDeniedConfiguration } from "./permission-denied.configuration";
import fallbackTranslation from "./permission-denied.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.PermissionDenied.Configuration",
  type: "CONFIGURATION",
  value: PermissionDeniedConfiguration,
};

const TRANSLATION: ComponentDependency = {
  id: "Recruit.PermissionDenied.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

export const PERMISSION_DENIED_COMPONENT: ComponentDefinition = {
  id: "Recruit.PermissionDenied.Component",
  type: "COMPONENT",
  value: PermissionDeniedComponent,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
  },
};
