import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { TodayWorkRenderer } from "@recruit/shared";
import { RecruiterTodayWorkConfiguration } from "./recruiter-today-work.configuration";
import { recruiterTodayWorkDatasource } from "./recruiter-today-work.datasource";
import fallbackTranslation from "./recruiter-today-work.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.Recruiter.DashboardTodayWork.Configuration",
  type: "CONFIGURATION",
  value: RecruiterTodayWorkConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.Recruiter.DashboardTodayWork.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.Recruiter.DashboardTodayWork.Datasource",
  type: "DATASOURCE",
  value: recruiterTodayWorkDatasource,
};

export const RECRUITER_TODAY_WORK_COMPONENT: ComponentDefinition = {
  id: "Recruit.Recruiter.DashboardTodayWork.Component",
  type: "COMPONENT",
  value: TodayWorkRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
