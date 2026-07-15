import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { FunnelRenderer } from "@recruit/shared";
import { LeadFunnelConfiguration } from "./lead-funnel.configuration";
import { leadFunnelDatasource } from "./lead-funnel.datasource";
import fallbackTranslation from "./lead-funnel.translations.json";

const LEAD_FUNNEL_CONFIGURATION: ComponentDependency = {
  id: "Recruit.LeadFunnel.Configuration",
  type: "CONFIGURATION",
  value: LeadFunnelConfiguration,
};

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
  value: FunnelRenderer,
  default: {
    configuration: LEAD_FUNNEL_CONFIGURATION,
    translation: LEAD_FUNNEL_TRANSLATION,
    datasource: LEAD_FUNNEL_DATASOURCE,
  },
};
