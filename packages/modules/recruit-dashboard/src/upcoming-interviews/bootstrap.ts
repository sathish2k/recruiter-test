import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { upcomingInterviewsDatasource } from "./upcoming-interviews.datasource";
import { UpcomingInterviewsComponent } from "./upcoming-interviews.component";
import fallbackTranslation from "./upcoming-interviews.translations.json";

const UPCOMING_CONFIGURATION: ComponentDependency = {
  id: "Recruit.UpcomingInterviews.Configuration",
  type: "CONFIGURATION",
  value: { viewAllRouteId: "Recruit.Interviews.Route" },
};

const UPCOMING_TRANSLATION: ComponentDependency = {
  id: "Recruit.UpcomingInterviews.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

const UPCOMING_DATASOURCE: ComponentDependency = {
  id: "Recruit.UpcomingInterviews.Datasource",
  type: "DATASOURCE",
  value: upcomingInterviewsDatasource,
};

export const UPCOMING_INTERVIEWS_COMPONENT: ComponentDefinition = {
  id: "Recruit.UpcomingInterviews.Component",
  type: "COMPONENT",
  value: UpcomingInterviewsComponent,
  default: {
    configuration: UPCOMING_CONFIGURATION,
    translation: UPCOMING_TRANSLATION,
    datasource: UPCOMING_DATASOURCE,
  },
};
