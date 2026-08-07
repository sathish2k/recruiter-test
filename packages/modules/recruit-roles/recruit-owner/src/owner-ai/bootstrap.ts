import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { AiInsightRenderer } from "@recruit/shared";
import { OwnerAiConfiguration } from "./owner-ai.configuration";
import { ownerAiDatasource } from "./owner-ai.datasource";
import fallbackTranslation from "./owner-ai.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.Owner.DashboardAi.Configuration",
  type: "CONFIGURATION",
  value: OwnerAiConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.Owner.DashboardAi.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.Owner.DashboardAi.Datasource",
  type: "DATASOURCE",
  value: ownerAiDatasource,
};

export const OWNER_AI_COMPONENT: ComponentDefinition = {
  id: "Recruit.Owner.DashboardAi.Component",
  type: "COMPONENT",
  value: AiInsightRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
