import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { TodayWorkRenderer } from "@recruit/shared";
import { HiringManagerTodayWorkConfiguration } from "./hiring-manager-today-work.configuration";
import { hiringManagerTodayWorkDatasource } from "./hiring-manager-today-work.datasource";
import fallbackTranslation from "./hiring-manager-today-work.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.HiringManager.DashboardTodayWork.Configuration",
  type: "CONFIGURATION",
  value: HiringManagerTodayWorkConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.HiringManager.DashboardTodayWork.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.HiringManager.DashboardTodayWork.Datasource",
  type: "DATASOURCE",
  value: hiringManagerTodayWorkDatasource,
};

export const HIRING_MANAGER_TODAY_WORK_COMPONENT: ComponentDefinition = {
  id: "Recruit.HiringManager.DashboardTodayWork.Component",
  type: "COMPONENT",
  value: TodayWorkRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
