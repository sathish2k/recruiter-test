import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { PlacementsComponent } from "./placements.component";
import { PlacementsConfiguration } from "./placements.configuration";
import { placementsDatasource } from "./placements.datasource";
import fallbackTranslation from "./placements.translations.json";

const PLACEMENTS_CONFIGURATION: ComponentDependency = {
  id: "Recruit.Placements.Configuration",
  type: "CONFIGURATION",
  value: PlacementsConfiguration,
};

const PLACEMENTS_TRANSLATION: ComponentDependency = {
  id: "Recruit.Placements.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

const PLACEMENTS_DATASOURCE: ComponentDependency = {
  id: "Recruit.Placements.Datasource",
  type: "DATASOURCE",
  value: placementsDatasource,
};

export const PLACEMENTS_COMPONENT: ComponentDefinition = {
  id: "Recruit.Placements.Component",
  type: "COMPONENT",
  value: PlacementsComponent,
  default: {
    configuration: PLACEMENTS_CONFIGURATION,
    translation: PLACEMENTS_TRANSLATION,
    datasource: PLACEMENTS_DATASOURCE,
  },
};
