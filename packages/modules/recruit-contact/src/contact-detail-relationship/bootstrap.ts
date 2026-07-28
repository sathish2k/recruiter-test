import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { ContactDetailRelationshipComponent } from "./contact-detail-relationship.component";
import { ContactDetailRelationshipConfiguration } from "./contact-detail-relationship.configuration";
import { contactDetailRelationshipDatasource } from "./contact-detail-relationship.datasource";
import fallbackTranslation from "./contact-detail-relationship.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.ContactDetailRelationship.Configuration",
  type: "CONFIGURATION",
  value: ContactDetailRelationshipConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.ContactDetailRelationship.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.ContactDetailRelationship.Datasource",
  type: "DATASOURCE",
  value: contactDetailRelationshipDatasource,
};

export const CONTACT_DETAIL_RELATIONSHIP_COMPONENT: ComponentDefinition = {
  id: "Recruit.ContactDetailRelationship.Component",
  type: "COMPONENT",
  value: ContactDetailRelationshipComponent,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
