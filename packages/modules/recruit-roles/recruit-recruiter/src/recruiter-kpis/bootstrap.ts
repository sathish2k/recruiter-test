import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { StatCardRenderer } from "@recruit/shared";
import { RecruiterKpisConfiguration } from "./recruiter-kpis.configuration";
import { recruiterKpisDatasource } from "./recruiter-kpis.datasource";
import fallbackTranslation from "./recruiter-kpis.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.Recruiter.DashboardStats.Configuration",
  type: "CONFIGURATION",
  value: RecruiterKpisConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.Recruiter.DashboardStats.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.Recruiter.DashboardStats.Datasource",
  type: "DATASOURCE",
  value: recruiterKpisDatasource,
};

export const RECRUITER_KPIS_COMPONENT: ComponentDefinition = {
  id: "Recruit.Recruiter.DashboardStats.Component",
  type: "COMPONENT",
  value: StatCardRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
