import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { NotFoundComponent } from "./not-found.component";
import { NotFoundConfiguration } from "./not-found.configuration";
import fallbackTranslation from "./not-found.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.NotFound.Configuration",
  type: "CONFIGURATION",
  value: NotFoundConfiguration,
};

const TRANSLATION: ComponentDependency = {
  id: "Recruit.NotFound.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

export const NOT_FOUND_COMPONENT: ComponentDefinition = {
  id: "Recruit.NotFound.Component",
  type: "COMPONENT",
  value: NotFoundComponent,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
  },
};
