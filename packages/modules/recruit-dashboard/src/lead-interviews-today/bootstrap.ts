import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { LeadInterviewsTodayComponent } from "./lead-interviews-today.component";
import { leadInterviewsTodayDatasource } from "./lead-interviews-today.datasource";
import fallbackTranslation from "./lead-interviews-today.translations.json";

const LEAD_INTERVIEWS_TODAY_TRANSLATION: ComponentDependency = {
  id: "Recruit.LeadInterviewsToday.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

const LEAD_INTERVIEWS_TODAY_DATASOURCE: ComponentDependency = {
  id: "Recruit.LeadInterviewsToday.Datasource",
  type: "DATASOURCE",
  value: leadInterviewsTodayDatasource,
};

export const LEAD_INTERVIEWS_TODAY_COMPONENT: ComponentDefinition = {
  id: "Recruit.LeadInterviewsToday.Component",
  type: "COMPONENT",
  value: LeadInterviewsTodayComponent,
  default: {
    translation: LEAD_INTERVIEWS_TODAY_TRANSLATION,
    datasource: LEAD_INTERVIEWS_TODAY_DATASOURCE,
  },
};
