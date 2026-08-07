import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { SideListRenderer } from "@recruit/shared";
import { RecruiterSideConfiguration } from "./recruiter-side.configuration";
import { recruiterSideDatasource } from "./recruiter-side.datasource";
import fallbackTranslation from "./recruiter-side.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.Recruiter.DashboardSide.Configuration",
  type: "CONFIGURATION",
  value: RecruiterSideConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.Recruiter.DashboardSide.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.Recruiter.DashboardSide.Datasource",
  type: "DATASOURCE",
  value: recruiterSideDatasource,
};

export const RECRUITER_SIDE_COMPONENT: ComponentDefinition = {
  id: "Recruit.Recruiter.DashboardSide.Component",
  type: "COMPONENT",
  value: SideListRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
