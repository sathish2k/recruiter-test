import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { AiInsightRenderer } from "@recruit/shared";
import { HiringManagerAiConfiguration } from "./hiring-manager-ai.configuration";
import { hiringManagerAiDatasource } from "./hiring-manager-ai.datasource";
import fallbackTranslation from "./hiring-manager-ai.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.HiringManager.DashboardAi.Configuration",
  type: "CONFIGURATION",
  value: HiringManagerAiConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.HiringManager.DashboardAi.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.HiringManager.DashboardAi.Datasource",
  type: "DATASOURCE",
  value: hiringManagerAiDatasource,
};

export const HIRING_MANAGER_AI_COMPONENT: ComponentDefinition = {
  id: "Recruit.HiringManager.DashboardAi.Component",
  type: "COMPONENT",
  value: AiInsightRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
