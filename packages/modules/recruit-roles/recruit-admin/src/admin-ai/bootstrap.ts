import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { AiInsightRenderer } from "@recruit/shared";
import { AdminAiConfiguration } from "./admin-ai.configuration";
import { adminAiDatasource } from "./admin-ai.datasource";
import fallbackTranslation from "./admin-ai.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.Admin.DashboardAi.Configuration",
  type: "CONFIGURATION",
  value: AdminAiConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.Admin.DashboardAi.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.Admin.DashboardAi.Datasource",
  type: "DATASOURCE",
  value: adminAiDatasource,
};

export const ADMIN_AI_COMPONENT: ComponentDefinition = {
  id: "Recruit.Admin.DashboardAi.Component",
  type: "COMPONENT",
  value: AiInsightRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
