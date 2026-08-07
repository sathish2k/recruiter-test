import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { ProgressCardRenderer } from "@recruit/shared";
import { SourcerWeekGoalsConfiguration } from "./sourcer-week-goals.configuration";
import { sourcerWeekGoalsDatasource } from "./sourcer-week-goals.datasource";
import fallbackTranslation from "./sourcer-week-goals.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.Sourcer.DashboardWeekGoals.Configuration",
  type: "CONFIGURATION",
  value: SourcerWeekGoalsConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.Sourcer.DashboardWeekGoals.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.Sourcer.DashboardWeekGoals.Datasource",
  type: "DATASOURCE",
  value: sourcerWeekGoalsDatasource,
};

export const SOURCER_WEEK_GOALS_COMPONENT: ComponentDefinition = {
  id: "Recruit.Sourcer.DashboardWeekGoals.Component",
  type: "COMPONENT",
  value: ProgressCardRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
