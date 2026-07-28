import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { ContactDetailHeaderComponent } from "./contact-detail-header.component";
import { ContactDetailHeaderConfiguration } from "./contact-detail-header.configuration";
import { contactDetailHeaderDatasource } from "./contact-detail-header.datasource";
import fallbackTranslation from "./contact-detail-header.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.ContactDetailHeader.Configuration",
  type: "CONFIGURATION",
  value: ContactDetailHeaderConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.ContactDetailHeader.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.ContactDetailHeader.Datasource",
  type: "DATASOURCE",
  value: contactDetailHeaderDatasource,
};

export const CONTACT_DETAIL_HEADER_COMPONENT: ComponentDefinition = {
  id: "Recruit.ContactDetailHeader.Component",
  type: "COMPONENT",
  value: ContactDetailHeaderComponent,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
