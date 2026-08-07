import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { SideListRenderer } from "@recruit/shared";
import { AdminActivityConfiguration } from "./admin-activity.configuration";
import { adminActivityDatasource } from "./admin-activity.datasource";
import fallbackTranslation from "./admin-activity.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.Admin.DashboardActivity.Configuration",
  type: "CONFIGURATION",
  value: AdminActivityConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.Admin.DashboardActivity.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.Admin.DashboardActivity.Datasource",
  type: "DATASOURCE",
  value: adminActivityDatasource,
};

export const ADMIN_ACTIVITY_COMPONENT: ComponentDefinition = {
  id: "Recruit.Admin.DashboardActivity.Component",
  type: "COMPONENT",
  value: SideListRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
