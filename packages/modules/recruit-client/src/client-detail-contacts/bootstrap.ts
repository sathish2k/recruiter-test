import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { ListRenderer } from "@recruit/shared";
import { ClientDetailContactsConfiguration } from "./client-detail-contacts.configuration";
import { clientDetailContactsDatasource } from "./client-detail-contacts.datasource";
import fallbackTranslation from "./client-detail-contacts.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.ClientDetailContacts.Configuration",
  type: "CONFIGURATION",
  value: ClientDetailContactsConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.ClientDetailContacts.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.ClientDetailContacts.Datasource",
  type: "DATASOURCE",
  value: clientDetailContactsDatasource,
};

export const CLIENT_DETAIL_CONTACTS_COMPONENT: ComponentDefinition = {
  id: "Recruit.ClientDetailContacts.Component",
  type: "COMPONENT",
  value: ListRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
