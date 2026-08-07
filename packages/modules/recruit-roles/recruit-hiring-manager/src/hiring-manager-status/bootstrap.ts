import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { StatusChipsRenderer } from "@recruit/shared";
import { HiringManagerStatusConfiguration } from "./hiring-manager-status.configuration";
import { hiringManagerStatusDatasource } from "./hiring-manager-status.datasource";
import fallbackTranslation from "./hiring-manager-status.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.HiringManager.DashboardStatus.Configuration",
  type: "CONFIGURATION",
  value: HiringManagerStatusConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.HiringManager.DashboardStatus.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.HiringManager.DashboardStatus.Datasource",
  type: "DATASOURCE",
  value: hiringManagerStatusDatasource,
};

export const HIRING_MANAGER_STATUS_COMPONENT: ComponentDefinition = {
  id: "Recruit.HiringManager.DashboardStatus.Component",
  type: "COMPONENT",
  value: StatusChipsRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
