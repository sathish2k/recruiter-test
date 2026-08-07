import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { BreadcrumbComponent } from "./breadcrumb.component";
import { BreadcrumbConfiguration } from "./breadcrumb.configuration";
import fallbackTranslation from "./breadcrumb.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.Breadcrumb.Configuration",
  type: "CONFIGURATION",
  value: BreadcrumbConfiguration,
};

const TRANSLATION: ComponentDependency = {
  id: "Recruit.Breadcrumb.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

export const BREADCRUMB_COMPONENT: ComponentDefinition = {
  id: "Recruit.Breadcrumb.Component",
  type: "COMPONENT",
  value: BreadcrumbComponent,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
  },
};
