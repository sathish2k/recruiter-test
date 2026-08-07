import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { StatCardRenderer } from "@recruit/shared";
import { HiringManagerKpisConfiguration } from "./hiring-manager-kpis.configuration";
import { hiringManagerKpisDatasource } from "./hiring-manager-kpis.datasource";
import fallbackTranslation from "./hiring-manager-kpis.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.HiringManager.DashboardStats.Configuration",
  type: "CONFIGURATION",
  value: HiringManagerKpisConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.HiringManager.DashboardStats.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.HiringManager.DashboardStats.Datasource",
  type: "DATASOURCE",
  value: hiringManagerKpisDatasource,
};

export const HIRING_MANAGER_KPIS_COMPONENT: ComponentDefinition = {
  id: "Recruit.HiringManager.DashboardStats.Component",
  type: "COMPONENT",
  value: StatCardRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
