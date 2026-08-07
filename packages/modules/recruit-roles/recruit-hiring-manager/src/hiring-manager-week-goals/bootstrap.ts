import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { ProgressCardRenderer } from "@recruit/shared";
import { HiringManagerWeekGoalsConfiguration } from "./hiring-manager-week-goals.configuration";
import { hiringManagerWeekGoalsDatasource } from "./hiring-manager-week-goals.datasource";
import fallbackTranslation from "./hiring-manager-week-goals.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.HiringManager.DashboardWeekGoals.Configuration",
  type: "CONFIGURATION",
  value: HiringManagerWeekGoalsConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.HiringManager.DashboardWeekGoals.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.HiringManager.DashboardWeekGoals.Datasource",
  type: "DATASOURCE",
  value: hiringManagerWeekGoalsDatasource,
};

export const HIRING_MANAGER_WEEK_GOALS_COMPONENT: ComponentDefinition = {
  id: "Recruit.HiringManager.DashboardWeekGoals.Component",
  type: "COMPONENT",
  value: ProgressCardRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
