import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { AiInsightRenderer } from "@recruit/shared";
import { AccountManagerAiConfiguration } from "./account-manager-ai.configuration";
import { accountManagerAiDatasource } from "./account-manager-ai.datasource";
import fallbackTranslation from "./account-manager-ai.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.AccountManager.DashboardAi.Configuration",
  type: "CONFIGURATION",
  value: AccountManagerAiConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.AccountManager.DashboardAi.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.AccountManager.DashboardAi.Datasource",
  type: "DATASOURCE",
  value: accountManagerAiDatasource,
};

export const ACCOUNT_MANAGER_AI_COMPONENT: ComponentDefinition = {
  id: "Recruit.AccountManager.DashboardAi.Component",
  type: "COMPONENT",
  value: AiInsightRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
