import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { AiInsightRenderer } from "@recruit/shared";
import { RecruiterAiConfiguration } from "./recruiter-ai.configuration";
import { recruiterAiDatasource } from "./recruiter-ai.datasource";
import fallbackTranslation from "./recruiter-ai.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.Recruiter.DashboardAi.Configuration",
  type: "CONFIGURATION",
  value: RecruiterAiConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.Recruiter.DashboardAi.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.Recruiter.DashboardAi.Datasource",
  type: "DATASOURCE",
  value: recruiterAiDatasource,
};

export const RECRUITER_AI_COMPONENT: ComponentDefinition = {
  id: "Recruit.Recruiter.DashboardAi.Component",
  type: "COMPONENT",
  value: AiInsightRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
