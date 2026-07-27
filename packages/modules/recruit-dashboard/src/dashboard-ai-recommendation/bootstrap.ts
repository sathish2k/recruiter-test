import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { CardRenderer } from "@recruit/shared";
import { DashboardAiRecommendationConfiguration } from "./dashboard-ai-recommendation.configuration";
import { dashboardAiRecommendationDatasource } from "./dashboard-ai-recommendation.datasource";
import fallbackTranslation from "./dashboard-ai-recommendation.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.DashboardAiRecommendation.Configuration",
  type: "CONFIGURATION",
  value: DashboardAiRecommendationConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.DashboardAiRecommendation.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.DashboardAiRecommendation.Datasource",
  type: "DATASOURCE",
  value: dashboardAiRecommendationDatasource,
};

export const DASHBOARD_AI_RECOMMENDATION_COMPONENT: ComponentDefinition = {
  id: "Recruit.DashboardAiRecommendation.Component",
  type: "COMPONENT",
  value: CardRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
