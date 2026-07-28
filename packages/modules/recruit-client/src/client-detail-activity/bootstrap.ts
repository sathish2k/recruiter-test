import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { ListRenderer } from "@recruit/shared";
import { ClientDetailActivityConfiguration } from "./client-detail-activity.configuration";
import { clientDetailActivityDatasource } from "./client-detail-activity.datasource";
import fallbackTranslation from "./client-detail-activity.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.ClientDetailActivity.Configuration",
  type: "CONFIGURATION",
  value: ClientDetailActivityConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.ClientDetailActivity.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.ClientDetailActivity.Datasource",
  type: "DATASOURCE",
  value: clientDetailActivityDatasource,
};

export const CLIENT_DETAIL_ACTIVITY_COMPONENT: ComponentDefinition = {
  id: "Recruit.ClientDetailActivity.Component",
  type: "COMPONENT",
  value: ListRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
