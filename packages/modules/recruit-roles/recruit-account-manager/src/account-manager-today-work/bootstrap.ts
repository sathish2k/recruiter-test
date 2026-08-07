import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { TodayWorkRenderer } from "@recruit/shared";
import { AccountManagerTodayWorkConfiguration } from "./account-manager-today-work.configuration";
import { accountManagerTodayWorkDatasource } from "./account-manager-today-work.datasource";
import fallbackTranslation from "./account-manager-today-work.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.AccountManager.DashboardTodayWork.Configuration",
  type: "CONFIGURATION",
  value: AccountManagerTodayWorkConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.AccountManager.DashboardTodayWork.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.AccountManager.DashboardTodayWork.Datasource",
  type: "DATASOURCE",
  value: accountManagerTodayWorkDatasource,
};

export const ACCOUNT_MANAGER_TODAY_WORK_COMPONENT: ComponentDefinition = {
  id: "Recruit.AccountManager.DashboardTodayWork.Component",
  type: "COMPONENT",
  value: TodayWorkRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
