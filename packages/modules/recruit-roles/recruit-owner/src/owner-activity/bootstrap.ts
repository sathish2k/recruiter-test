import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { SideListRenderer } from "@recruit/shared";
import { OwnerActivityConfiguration } from "./owner-activity.configuration";
import { ownerActivityDatasource } from "./owner-activity.datasource";
import fallbackTranslation from "./owner-activity.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.Owner.DashboardActivity.Configuration",
  type: "CONFIGURATION",
  value: OwnerActivityConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.Owner.DashboardActivity.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.Owner.DashboardActivity.Datasource",
  type: "DATASOURCE",
  value: ownerActivityDatasource,
};

export const OWNER_ACTIVITY_COMPONENT: ComponentDefinition = {
  id: "Recruit.Owner.DashboardActivity.Component",
  type: "COMPONENT",
  value: SideListRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
