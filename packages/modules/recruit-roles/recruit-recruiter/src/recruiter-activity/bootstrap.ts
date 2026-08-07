import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { SideListRenderer } from "@recruit/shared";
import { RecruiterActivityConfiguration } from "./recruiter-activity.configuration";
import { recruiterActivityDatasource } from "./recruiter-activity.datasource";
import fallbackTranslation from "./recruiter-activity.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.Recruiter.DashboardActivity.Configuration",
  type: "CONFIGURATION",
  value: RecruiterActivityConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.Recruiter.DashboardActivity.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.Recruiter.DashboardActivity.Datasource",
  type: "DATASOURCE",
  value: recruiterActivityDatasource,
};

export const RECRUITER_ACTIVITY_COMPONENT: ComponentDefinition = {
  id: "Recruit.Recruiter.DashboardActivity.Component",
  type: "COMPONENT",
  value: SideListRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
