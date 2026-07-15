import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { LeadClientDecisionsComponent } from "./lead-client-decisions.component";
import { leadClientDecisionsDatasource } from "./lead-client-decisions.datasource";
import fallbackTranslation from "./lead-client-decisions.translations.json";

const LEAD_CLIENT_DECISIONS_TRANSLATION: ComponentDependency = {
  id: "Recruit.LeadClientDecisions.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

const LEAD_CLIENT_DECISIONS_DATASOURCE: ComponentDependency = {
  id: "Recruit.LeadClientDecisions.Datasource",
  type: "DATASOURCE",
  value: leadClientDecisionsDatasource,
};

export const LEAD_CLIENT_DECISIONS_COMPONENT: ComponentDefinition = {
  id: "Recruit.LeadClientDecisions.Component",
  type: "COMPONENT",
  value: LeadClientDecisionsComponent,
  default: {
    translation: LEAD_CLIENT_DECISIONS_TRANSLATION,
    datasource: LEAD_CLIENT_DECISIONS_DATASOURCE,
  },
};
