import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { InterviewsComponent } from "./interviews.component";
import { InterviewsConfiguration } from "./interviews.configuration";
import { interviewsDatasource } from "./interviews.datasource";
import fallbackTranslation from "./interviews.translations.json";

const INTERVIEWS_CONFIGURATION: ComponentDependency = {
  id: "Recruit.Interviews.Configuration",
  type: "CONFIGURATION",
  value: InterviewsConfiguration,
};

const INTERVIEWS_TRANSLATION: ComponentDependency = {
  id: "Recruit.Interviews.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

const INTERVIEWS_DATASOURCE: ComponentDependency = {
  id: "Recruit.Interviews.Datasource",
  type: "DATASOURCE",
  value: interviewsDatasource,
};

export const INTERVIEWS_COMPONENT: ComponentDefinition = {
  id: "Recruit.Interviews.Component",
  type: "COMPONENT",
  value: InterviewsComponent,
  default: {
    configuration: INTERVIEWS_CONFIGURATION,
    translation: INTERVIEWS_TRANSLATION,
    datasource: INTERVIEWS_DATASOURCE,
  },
};
