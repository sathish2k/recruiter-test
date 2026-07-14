import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { interviewsDatasource } from "./next-interview.datasource";
import { NextInterviewComponent } from "./next-interview.component";
import fallbackTranslation from "./next-interview.translations.json";

const NEXT_INTERVIEW_CONFIGURATION: ComponentDependency = {
  id: "Recruit.NextInterview.Configuration",
  type: "CONFIGURATION",
  value: {},
};

const NEXT_INTERVIEW_TRANSLATION: ComponentDependency = {
  id: "Recruit.NextInterview.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

const NEXT_INTERVIEW_DATASOURCE: ComponentDependency = {
  id: "Recruit.NextInterview.Datasource",
  type: "DATASOURCE",
  value: interviewsDatasource,
};

export const NEXT_INTERVIEW_COMPONENT: ComponentDefinition = {
  id: "Recruit.NextInterview.Component",
  type: "COMPONENT",
  value: NextInterviewComponent,
  default: {
    configuration: NEXT_INTERVIEW_CONFIGURATION,
    translation: NEXT_INTERVIEW_TRANSLATION,
    datasource: NEXT_INTERVIEW_DATASOURCE,
  },
};
