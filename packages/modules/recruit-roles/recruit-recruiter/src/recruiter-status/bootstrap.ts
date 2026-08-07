import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { StatusChipsRenderer } from "@recruit/shared";
import { RecruiterStatusConfiguration } from "./recruiter-status.configuration";
import { recruiterStatusDatasource } from "./recruiter-status.datasource";
import fallbackTranslation from "./recruiter-status.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.Recruiter.DashboardStatus.Configuration",
  type: "CONFIGURATION",
  value: RecruiterStatusConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.Recruiter.DashboardStatus.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.Recruiter.DashboardStatus.Datasource",
  type: "DATASOURCE",
  value: recruiterStatusDatasource,
};

export const RECRUITER_STATUS_COMPONENT: ComponentDefinition = {
  id: "Recruit.Recruiter.DashboardStatus.Component",
  type: "COMPONENT",
  value: StatusChipsRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
