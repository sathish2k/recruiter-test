import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { SideListRenderer } from "@recruit/shared";
import { AccountManagerRecentsConfiguration } from "./account-manager-recents.configuration";
import { accountManagerRecentsDatasource } from "./account-manager-recents.datasource";
import fallbackTranslation from "./account-manager-recents.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.AccountManager.DashboardRecents.Configuration",
  type: "CONFIGURATION",
  value: AccountManagerRecentsConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.AccountManager.DashboardRecents.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.AccountManager.DashboardRecents.Datasource",
  type: "DATASOURCE",
  value: accountManagerRecentsDatasource,
};

export const ACCOUNT_MANAGER_RECENTS_COMPONENT: ComponentDefinition = {
  id: "Recruit.AccountManager.DashboardRecents.Component",
  type: "COMPONENT",
  value: SideListRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
