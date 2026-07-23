import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { ClientDetailComponent } from "./client-detail.component";
import { clientDetailDatasource } from "./client-detail.datasource";
import fallbackTranslation from "./client-detail.translations.json";

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
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
