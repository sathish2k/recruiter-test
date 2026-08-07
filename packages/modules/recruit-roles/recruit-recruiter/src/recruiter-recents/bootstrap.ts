import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { SideListRenderer } from "@recruit/shared";
import { RecruiterRecentsConfiguration } from "./recruiter-recents.configuration";
import { recruiterRecentsDatasource } from "./recruiter-recents.datasource";
import fallbackTranslation from "./recruiter-recents.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.Recruiter.DashboardRecents.Configuration",
  type: "CONFIGURATION",
  value: RecruiterRecentsConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.Recruiter.DashboardRecents.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.Recruiter.DashboardRecents.Datasource",
  type: "DATASOURCE",
  value: recruiterRecentsDatasource,
};

export const RECRUITER_RECENTS_COMPONENT: ComponentDefinition = {
  id: "Recruit.Recruiter.DashboardRecents.Component",
  type: "COMPONENT",
  value: SideListRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
