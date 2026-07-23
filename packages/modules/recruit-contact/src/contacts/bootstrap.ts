import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { ContactsComponent } from "./contacts.component";
import { ContactsConfiguration } from "./contacts.configuration";
import { contactsDatasource } from "./contacts.datasource";
import fallbackTranslation from "./contacts.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.Contacts.Configuration",
  type: "CONFIGURATION",
  value: ContactsConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.Contacts.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.Contacts.Datasource",
  type: "DATASOURCE",
  value: contactsDatasource,
};

export const CONTACTS_COMPONENT: ComponentDefinition = {
  id: "Recruit.Contacts.Component",
  type: "COMPONENT",
  value: ContactsComponent,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
