import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { LeadFunnelComponent } from "./lead-funnel.component";
import { leadFunnelDatasource } from "./lead-funnel.datasource";
import fallbackTranslation from "./lead-funnel.translations.json";

const LEAD_FUNNEL_TRANSLATION: ComponentDependency = {
  id: "Recruit.LeadFunnel.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

const LEAD_FUNNEL_DATASOURCE: ComponentDependency = {
  id: "Recruit.LeadFunnel.Datasource",
  type: "DATASOURCE",
  value: leadFunnelDatasource,
};

export const LEAD_FUNNEL_COMPONENT: ComponentDefinition = {
  id: "Recruit.LeadFunnel.Component",
  type: "COMPONENT",
  value: LeadFunnelComponent,
  default: {
    translation: LEAD_FUNNEL_TRANSLATION,
    datasource: LEAD_FUNNEL_DATASOURCE,
  },
};
