import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { SideListRenderer } from "@recruit/shared";
import { HiringManagerActivityConfiguration } from "./hiring-manager-activity.configuration";
import { hiringmanagerActivityDatasource } from "./hiring-manager-activity.datasource";
import fallbackTranslation from "./hiring-manager-activity.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.HiringManager.DashboardActivity.Configuration",
  type: "CONFIGURATION",
  value: HiringManagerActivityConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.HiringManager.DashboardActivity.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.HiringManager.DashboardActivity.Datasource",
  type: "DATASOURCE",
  value: hiringmanagerActivityDatasource,
};

export const HIRING_MANAGER_ACTIVITY_COMPONENT: ComponentDefinition = {
  id: "Recruit.HiringManager.DashboardActivity.Component",
  type: "COMPONENT",
  value: SideListRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
