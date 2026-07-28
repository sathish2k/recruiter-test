import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { StatCardRenderer } from "@recruit/shared";
import { ContactDetailStatsConfiguration } from "./contact-detail-stats.configuration";
import { contactDetailStatsDatasource } from "./contact-detail-stats.datasource";
import fallbackTranslation from "./contact-detail-stats.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.ContactDetailStats.Configuration",
  type: "CONFIGURATION",
  value: ContactDetailStatsConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.ContactDetailStats.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.ContactDetailStats.Datasource",
  type: "DATASOURCE",
  value: contactDetailStatsDatasource,
};

export const CONTACT_DETAIL_STATS_COMPONENT: ComponentDefinition = {
  id: "Recruit.ContactDetailStats.Component",
  type: "COMPONENT",
  value: StatCardRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
