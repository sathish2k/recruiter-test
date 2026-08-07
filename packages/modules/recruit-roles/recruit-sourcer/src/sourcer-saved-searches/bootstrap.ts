import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { SideListRenderer } from "@recruit/shared";
import { SourcerSavedSearchesConfiguration } from "./sourcer-saved-searches.configuration";
import { sourcerSavedSearchesDatasource } from "./sourcer-saved-searches.datasource";
import fallbackTranslation from "./sourcer-saved-searches.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.Sourcer.DashboardSavedSearches.Configuration",
  type: "CONFIGURATION",
  value: SourcerSavedSearchesConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.Sourcer.DashboardSavedSearches.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.Sourcer.DashboardSavedSearches.Datasource",
  type: "DATASOURCE",
  value: sourcerSavedSearchesDatasource,
};

export const SOURCER_SAVED_SEARCHES_COMPONENT: ComponentDefinition = {
  id: "Recruit.Sourcer.DashboardSavedSearches.Component",
  type: "COMPONENT",
  value: SideListRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
