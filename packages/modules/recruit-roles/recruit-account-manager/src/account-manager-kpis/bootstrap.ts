import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { StatCardRenderer } from "@recruit/shared";
import { AccountManagerKpisConfiguration } from "./account-manager-kpis.configuration";
import { accountManagerKpisDatasource } from "./account-manager-kpis.datasource";
import fallbackTranslation from "./account-manager-kpis.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.AccountManager.DashboardStats.Configuration",
  type: "CONFIGURATION",
  value: AccountManagerKpisConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.AccountManager.DashboardStats.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.AccountManager.DashboardStats.Datasource",
  type: "DATASOURCE",
  value: accountManagerKpisDatasource,
};

export const ACCOUNT_MANAGER_KPIS_COMPONENT: ComponentDefinition = {
  id: "Recruit.AccountManager.DashboardStats.Component",
  type: "COMPONENT",
  value: StatCardRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
