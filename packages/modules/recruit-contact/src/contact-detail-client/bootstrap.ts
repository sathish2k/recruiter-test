import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { ContactDetailClientComponent } from "./contact-detail-client.component";
import { ContactDetailClientConfiguration } from "./contact-detail-client.configuration";
import { contactDetailClientDatasource } from "./contact-detail-client.datasource";
import fallbackTranslation from "./contact-detail-client.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.ContactDetailClient.Configuration",
  type: "CONFIGURATION",
  value: ContactDetailClientConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.ContactDetailClient.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.ContactDetailClient.Datasource",
  type: "DATASOURCE",
  value: contactDetailClientDatasource,
};

export const CONTACT_DETAIL_CLIENT_COMPONENT: ComponentDefinition = {
  id: "Recruit.ContactDetailClient.Component",
  type: "COMPONENT",
  value: ContactDetailClientComponent,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
