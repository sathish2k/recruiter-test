import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { TodayWorkRenderer } from "@recruit/shared";
import { AdminTodayWorkConfiguration } from "./admin-today-work.configuration";
import { adminTodayWorkDatasource } from "./admin-today-work.datasource";
import fallbackTranslation from "./admin-today-work.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.Admin.DashboardTodayWork.Configuration",
  type: "CONFIGURATION",
  value: AdminTodayWorkConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.Admin.DashboardTodayWork.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.Admin.DashboardTodayWork.Datasource",
  type: "DATASOURCE",
  value: adminTodayWorkDatasource,
};

export const ADMIN_TODAY_WORK_COMPONENT: ComponentDefinition = {
  id: "Recruit.Admin.DashboardTodayWork.Component",
  type: "COMPONENT",
  value: TodayWorkRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
