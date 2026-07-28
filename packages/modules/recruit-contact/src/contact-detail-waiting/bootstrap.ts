import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { ContactDetailWaitingComponent } from "./contact-detail-waiting.component";
import { ContactDetailWaitingConfiguration } from "./contact-detail-waiting.configuration";
import { contactDetailWaitingDatasource } from "./contact-detail-waiting.datasource";
import fallbackTranslation from "./contact-detail-waiting.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.ContactDetailWaiting.Configuration",
  type: "CONFIGURATION",
  value: ContactDetailWaitingConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.ContactDetailWaiting.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.ContactDetailWaiting.Datasource",
  type: "DATASOURCE",
  value: contactDetailWaitingDatasource,
};

export const CONTACT_DETAIL_WAITING_COMPONENT: ComponentDefinition = {
  id: "Recruit.ContactDetailWaiting.Component",
  type: "COMPONENT",
  value: ContactDetailWaitingComponent,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
