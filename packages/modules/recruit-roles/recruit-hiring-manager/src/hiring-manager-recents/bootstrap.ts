import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { SideListRenderer } from "@recruit/shared";
import { HiringManagerRecentsConfiguration } from "./hiring-manager-recents.configuration";
import { hiringManagerRecentsDatasource } from "./hiring-manager-recents.datasource";
import fallbackTranslation from "./hiring-manager-recents.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.HiringManager.DashboardRecents.Configuration",
  type: "CONFIGURATION",
  value: HiringManagerRecentsConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.HiringManager.DashboardRecents.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.HiringManager.DashboardRecents.Datasource",
  type: "DATASOURCE",
  value: hiringManagerRecentsDatasource,
};

export const HIRING_MANAGER_RECENTS_COMPONENT: ComponentDefinition = {
  id: "Recruit.HiringManager.DashboardRecents.Component",
  type: "COMPONENT",
  value: SideListRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
