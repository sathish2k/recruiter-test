import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { ProgressCardRenderer } from "@recruit/shared";
import { RecruiterWeekGoalsConfiguration } from "./recruiter-week-goals.configuration";
import { recruiterWeekGoalsDatasource } from "./recruiter-week-goals.datasource";
import fallbackTranslation from "./recruiter-week-goals.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.Recruiter.DashboardWeekGoals.Configuration",
  type: "CONFIGURATION",
  value: RecruiterWeekGoalsConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.Recruiter.DashboardWeekGoals.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.Recruiter.DashboardWeekGoals.Datasource",
  type: "DATASOURCE",
  value: recruiterWeekGoalsDatasource,
};

export const RECRUITER_WEEK_GOALS_COMPONENT: ComponentDefinition = {
  id: "Recruit.Recruiter.DashboardWeekGoals.Component",
  type: "COMPONENT",
  value: ProgressCardRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
