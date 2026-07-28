import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { ContactDetailInfoComponent } from "./contact-detail-info.component";
import { ContactDetailInfoConfiguration } from "./contact-detail-info.configuration";
import { contactDetailInfoDatasource } from "./contact-detail-info.datasource";
import fallbackTranslation from "./contact-detail-info.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.ContactDetailInfo.Configuration",
  type: "CONFIGURATION",
  value: ContactDetailInfoConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.ContactDetailInfo.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.ContactDetailInfo.Datasource",
  type: "DATASOURCE",
  value: contactDetailInfoDatasource,
};

export const CONTACT_DETAIL_INFO_COMPONENT: ComponentDefinition = {
  id: "Recruit.ContactDetailInfo.Component",
  type: "COMPONENT",
  value: ContactDetailInfoComponent,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
