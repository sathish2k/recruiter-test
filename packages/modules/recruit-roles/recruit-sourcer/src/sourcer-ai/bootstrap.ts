import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { AiInsightRenderer } from "@recruit/shared";
import { SourcerAiConfiguration } from "./sourcer-ai.configuration";
import { sourcerAiDatasource } from "./sourcer-ai.datasource";
import fallbackTranslation from "./sourcer-ai.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.Sourcer.DashboardAi.Configuration",
  type: "CONFIGURATION",
  value: SourcerAiConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.Sourcer.DashboardAi.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.Sourcer.DashboardAi.Datasource",
  type: "DATASOURCE",
  value: sourcerAiDatasource,
};

export const SOURCER_AI_COMPONENT: ComponentDefinition = {
  id: "Recruit.Sourcer.DashboardAi.Component",
  type: "COMPONENT",
  value: AiInsightRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
