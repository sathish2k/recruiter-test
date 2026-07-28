import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { ClientDetailHeaderComponent } from "./client-detail-header.component";
import { ClientDetailHeaderConfiguration } from "./client-detail-header.configuration";
import { clientDetailHeaderDatasource } from "./client-detail-header.datasource";
import fallbackTranslation from "./client-detail-header.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.ClientDetailHeader.Configuration",
  type: "CONFIGURATION",
  value: ClientDetailHeaderConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.ClientDetailHeader.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.ClientDetailHeader.Datasource",
  type: "DATASOURCE",
  value: clientDetailHeaderDatasource,
};

export const CLIENT_DETAIL_HEADER_COMPONENT: ComponentDefinition = {
  id: "Recruit.ClientDetailHeader.Component",
  type: "COMPONENT",
  value: ClientDetailHeaderComponent,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
