import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { ClientDetailAgreementComponent } from "./client-detail-agreement.component";
import { ClientDetailAgreementConfiguration } from "./client-detail-agreement.configuration";
import { clientDetailAgreementDatasource } from "./client-detail-agreement.datasource";
import fallbackTranslation from "./client-detail-agreement.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.ClientDetailAgreement.Configuration",
  type: "CONFIGURATION",
  value: ClientDetailAgreementConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.ClientDetailAgreement.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.ClientDetailAgreement.Datasource",
  type: "DATASOURCE",
  value: clientDetailAgreementDatasource,
};

export const CLIENT_DETAIL_AGREEMENT_COMPONENT: ComponentDefinition = {
  id: "Recruit.ClientDetailAgreement.Component",
  type: "COMPONENT",
  value: ClientDetailAgreementComponent,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
