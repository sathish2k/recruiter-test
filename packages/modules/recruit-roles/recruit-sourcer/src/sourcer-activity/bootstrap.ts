import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { SideListRenderer } from "@recruit/shared";
import { SourcerActivityConfiguration } from "./sourcer-activity.configuration";
import { sourcerActivityDatasource } from "./sourcer-activity.datasource";
import fallbackTranslation from "./sourcer-activity.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.Sourcer.DashboardActivity.Configuration",
  type: "CONFIGURATION",
  value: SourcerActivityConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.Sourcer.DashboardActivity.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.Sourcer.DashboardActivity.Datasource",
  type: "DATASOURCE",
  value: sourcerActivityDatasource,
};

export const SOURCER_ACTIVITY_COMPONENT: ComponentDefinition = {
  id: "Recruit.Sourcer.DashboardActivity.Component",
  type: "COMPONENT",
  value: SideListRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
