import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { LeadGreetingComponent } from "./lead-greeting.component";
import { leadGreetingDatasource } from "./lead-greeting.datasource";
import fallbackTranslation from "./lead-greeting.translations.json";

const LEAD_GREETING_TRANSLATION: ComponentDependency = {
  id: "Recruit.LeadGreeting.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

const LEAD_GREETING_DATASOURCE: ComponentDependency = {
  id: "Recruit.LeadGreeting.Datasource",
  type: "DATASOURCE",
  value: leadGreetingDatasource,
};

export const LEAD_GREETING_COMPONENT: ComponentDefinition = {
  id: "Recruit.LeadGreeting.Component",
  type: "COMPONENT",
  value: LeadGreetingComponent,
  default: {
    translation: LEAD_GREETING_TRANSLATION,
    datasource: LEAD_GREETING_DATASOURCE,
  },
};
