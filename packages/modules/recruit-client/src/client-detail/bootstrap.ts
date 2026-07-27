import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { ClientDetailComponent } from "./client-detail.component";
import { ClientDetailConfiguration } from "./client-detail.configuration";
import { clientDetailDatasource } from "./client-detail.datasource";
import fallbackTranslation from "./client-detail.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.ClientDetail.Configuration",
  type: "CONFIGURATION",
  value: ClientDetailConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.ClientDetail.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.ClientDetail.Datasource",
  type: "DATASOURCE",
  value: clientDetailDatasource,
};

export const CLIENT_DETAIL_COMPONENT: ComponentDefinition = {
  id: "Recruit.ClientDetail.Component",
  type: "COMPONENT",
  value: ClientDetailComponent,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
