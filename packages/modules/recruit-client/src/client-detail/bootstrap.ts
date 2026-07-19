import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { ClientDetailComponent } from "./client-detail.component";
import { ClientDetailConfiguration } from "./client-detail.configuration";
import { clientDetailDatasource } from "./client-detail.datasource";
import fallbackTranslation from "./client-detail.translations.json";

const CLIENT_DETAIL_CONFIGURATION: ComponentDependency = {
  id: "Recruit.ClientDetail.Configuration",
  type: "CONFIGURATION",
  value: ClientDetailConfiguration,
};

const CLIENT_DETAIL_TRANSLATION: ComponentDependency = {
  id: "Recruit.ClientDetail.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

const CLIENT_DETAIL_DATASOURCE: ComponentDependency = {
  id: "Recruit.ClientDetail.Datasource",
  type: "DATASOURCE",
  value: clientDetailDatasource,
};

export const CLIENT_DETAIL_COMPONENT: ComponentDefinition = {
  id: "Recruit.ClientDetail.Component",
  type: "COMPONENT",
  value: ClientDetailComponent,
  default: {
    configuration: CLIENT_DETAIL_CONFIGURATION,
    translation: CLIENT_DETAIL_TRANSLATION,
    datasource: CLIENT_DETAIL_DATASOURCE,
  },
};
