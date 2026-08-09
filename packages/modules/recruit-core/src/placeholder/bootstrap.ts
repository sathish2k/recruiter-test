import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { PagePlaceholderComponent } from "./placeholder.component";
import fallbackTranslation from "./placeholder.translations.json";

const PLACEHOLDER_TRANSLATION: ComponentDependency = {
  id: "Core.Placeholder.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

export const PLACEHOLDER_COMPONENT: ComponentDefinition = {
  id: "Core.Placeholder.Component",
  type: "COMPONENT",
  value: PagePlaceholderComponent,
  default: {
    translation: PLACEHOLDER_TRANSLATION,
  },
};
