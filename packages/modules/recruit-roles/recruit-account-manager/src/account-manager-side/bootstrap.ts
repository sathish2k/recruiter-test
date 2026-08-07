import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { SideListRenderer } from "@recruit/shared";
import { AccountManagerSideConfiguration } from "./account-manager-side.configuration";
import { accountManagerSideDatasource } from "./account-manager-side.datasource";
import fallbackTranslation from "./account-manager-side.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.AccountManager.DashboardSide.Configuration",
  type: "CONFIGURATION",
  value: AccountManagerSideConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.AccountManager.DashboardSide.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.AccountManager.DashboardSide.Datasource",
  type: "DATASOURCE",
  value: accountManagerSideDatasource,
};

export const ACCOUNT_MANAGER_SIDE_COMPONENT: ComponentDefinition = {
  id: "Recruit.AccountManager.DashboardSide.Component",
  type: "COMPONENT",
  value: SideListRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
