import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { SideListRenderer } from "@recruit/shared";
import { ClientActivityConfiguration } from "./client-activity.configuration";
import { clientActivityDatasource } from "./client-activity.datasource";
import fallbackTranslation from "./client-activity.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.Client.DashboardActivity.Configuration",
  type: "CONFIGURATION",
  value: ClientActivityConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.Client.DashboardActivity.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.Client.DashboardActivity.Datasource",
  type: "DATASOURCE",
  value: clientActivityDatasource,
};

export const CLIENT_ACTIVITY_COMPONENT: ComponentDefinition = {
  id: "Recruit.Client.DashboardActivity.Component",
  type: "COMPONENT",
  value: SideListRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
