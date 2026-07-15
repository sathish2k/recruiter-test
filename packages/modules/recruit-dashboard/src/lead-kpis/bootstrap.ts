import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { LeadKpisComponent } from "./lead-kpis.component";
import { LeadKpisConfiguration } from "./lead-kpis.configuration";
import { leadKpisDatasource } from "./lead-kpis.datasource";
import fallbackTranslation from "./lead-kpis.translations.json";

const LEAD_KPIS_CONFIGURATION: ComponentDependency = {
  id: "Recruit.LeadKpis.Configuration",
  type: "CONFIGURATION",
  value: LeadKpisConfiguration,
};

const LEAD_KPIS_TRANSLATION: ComponentDependency = {
  id: "Recruit.LeadKpis.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

const LEAD_KPIS_DATASOURCE: ComponentDependency = {
  id: "Recruit.LeadKpis.Datasource",
  type: "DATASOURCE",
  value: leadKpisDatasource,
};

export const LEAD_KPIS_COMPONENT: ComponentDefinition = {
  id: "Recruit.LeadKpis.Component",
  type: "COMPONENT",
  value: LeadKpisComponent,
  default: {
    configuration: LEAD_KPIS_CONFIGURATION,
    translation: LEAD_KPIS_TRANSLATION,
    datasource: LEAD_KPIS_DATASOURCE,
  },
};
