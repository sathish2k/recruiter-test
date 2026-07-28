import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { ContactDetailBriefingComponent } from "./contact-detail-briefing.component";
import { ContactDetailBriefingConfiguration } from "./contact-detail-briefing.configuration";
import { contactDetailBriefingDatasource } from "./contact-detail-briefing.datasource";
import fallbackTranslation from "./contact-detail-briefing.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.ContactDetailBriefing.Configuration",
  type: "CONFIGURATION",
  value: ContactDetailBriefingConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.ContactDetailBriefing.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.ContactDetailBriefing.Datasource",
  type: "DATASOURCE",
  value: contactDetailBriefingDatasource,
};

export const CONTACT_DETAIL_BRIEFING_COMPONENT: ComponentDefinition = {
  id: "Recruit.ContactDetailBriefing.Component",
  type: "COMPONENT",
  value: ContactDetailBriefingComponent,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
