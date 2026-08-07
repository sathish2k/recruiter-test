import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { StatusChipsRenderer } from "@recruit/shared";
import { AccountManagerStatusConfiguration } from "./account-manager-status.configuration";
import { accountManagerStatusDatasource } from "./account-manager-status.datasource";
import fallbackTranslation from "./account-manager-status.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.AccountManager.DashboardStatus.Configuration",
  type: "CONFIGURATION",
  value: AccountManagerStatusConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.AccountManager.DashboardStatus.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.AccountManager.DashboardStatus.Datasource",
  type: "DATASOURCE",
  value: accountManagerStatusDatasource,
};

export const ACCOUNT_MANAGER_STATUS_COMPONENT: ComponentDefinition = {
  id: "Recruit.AccountManager.DashboardStatus.Component",
  type: "COMPONENT",
  value: StatusChipsRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
