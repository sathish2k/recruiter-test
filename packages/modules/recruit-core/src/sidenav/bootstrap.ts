import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { SidenavComponent } from "./sidenav.component";
import { SidenavConfiguration } from "./sidenav.configuration";
import fallbackTranslation from "./sidenav.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.Sidenav.Configuration",
  type: "CONFIGURATION",
  value: SidenavConfiguration,
};

const TRANSLATION: ComponentDependency = {
  id: "Recruit.Sidenav.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

export const SIDENAV_COMPONENT: ComponentDefinition = {
  id: "Recruit.Sidenav.Component",
  type: "COMPONENT",
  value: SidenavComponent,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
  },
};
