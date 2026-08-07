import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { QueueCardRenderer } from "@recruit/shared";
import { AccountManagerQueueConfiguration } from "./account-manager-queue.configuration";
import { accountManagerQueueDatasource } from "./account-manager-queue.datasource";
import fallbackTranslation from "./account-manager-queue.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.AccountManager.DashboardQueue.Configuration",
  type: "CONFIGURATION",
  value: AccountManagerQueueConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.AccountManager.DashboardQueue.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.AccountManager.DashboardQueue.Datasource",
  type: "DATASOURCE",
  value: accountManagerQueueDatasource,
};

export const ACCOUNT_MANAGER_QUEUE_COMPONENT: ComponentDefinition = {
  id: "Recruit.AccountManager.DashboardQueue.Component",
  type: "COMPONENT",
  value: QueueCardRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
