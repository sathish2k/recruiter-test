import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { LeadSourcersComponent } from "./lead-sourcers.component";
import { LeadSourcersConfiguration } from "./lead-sourcers.configuration";
import { leadSourcersDatasource } from "./lead-sourcers.datasource";
import fallbackTranslation from "./lead-sourcers.translations.json";

const LEAD_SOURCERS_CONFIGURATION: ComponentDependency = {
  id: "Recruit.LeadSourcers.Configuration",
  type: "CONFIGURATION",
  value: LeadSourcersConfiguration,
};

const LEAD_SOURCERS_TRANSLATION: ComponentDependency = {
  id: "Recruit.LeadSourcers.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

const LEAD_SOURCERS_DATASOURCE: ComponentDependency = {
  id: "Recruit.LeadSourcers.Datasource",
  type: "DATASOURCE",
  value: leadSourcersDatasource,
};

export const LEAD_SOURCERS_COMPONENT: ComponentDefinition = {
  id: "Recruit.LeadSourcers.Component",
  type: "COMPONENT",
  value: LeadSourcersComponent,
  default: {
    configuration: LEAD_SOURCERS_CONFIGURATION,
    translation: LEAD_SOURCERS_TRANSLATION,
    datasource: LEAD_SOURCERS_DATASOURCE,
  },
};
