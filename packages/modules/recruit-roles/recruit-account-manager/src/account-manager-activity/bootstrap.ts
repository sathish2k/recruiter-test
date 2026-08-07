import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { SideListRenderer } from "@recruit/shared";
import { AccountManagerActivityConfiguration } from "./account-manager-activity.configuration";
import { accountmanagerActivityDatasource } from "./account-manager-activity.datasource";
import fallbackTranslation from "./account-manager-activity.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.AccountManager.DashboardActivity.Configuration",
  type: "CONFIGURATION",
  value: AccountManagerActivityConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.AccountManager.DashboardActivity.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.AccountManager.DashboardActivity.Datasource",
  type: "DATASOURCE",
  value: accountmanagerActivityDatasource,
};

export const ACCOUNT_MANAGER_ACTIVITY_COMPONENT: ComponentDefinition = {
  id: "Recruit.AccountManager.DashboardActivity.Component",
  type: "COMPONENT",
  value: SideListRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
