import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { SideListRenderer } from "@recruit/shared";
import { SourcerRecentsConfiguration } from "./sourcer-recents.configuration";
import { sourcerRecentsDatasource } from "./sourcer-recents.datasource";
import fallbackTranslation from "./sourcer-recents.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.Sourcer.DashboardRecents.Configuration",
  type: "CONFIGURATION",
  value: SourcerRecentsConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.Sourcer.DashboardRecents.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.Sourcer.DashboardRecents.Datasource",
  type: "DATASOURCE",
  value: sourcerRecentsDatasource,
};

export const SOURCER_RECENTS_COMPONENT: ComponentDefinition = {
  id: "Recruit.Sourcer.DashboardRecents.Component",
  type: "COMPONENT",
  value: SideListRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
