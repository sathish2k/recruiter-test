import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { StatCardRenderer } from "@recruit/shared";
import { ClientDetailStatsConfiguration } from "./client-detail-stats.configuration";
import { clientDetailStatsDatasource } from "./client-detail-stats.datasource";
import fallbackTranslation from "./client-detail-stats.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.ClientDetailStats.Configuration",
  type: "CONFIGURATION",
  value: ClientDetailStatsConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.ClientDetailStats.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.ClientDetailStats.Datasource",
  type: "DATASOURCE",
  value: clientDetailStatsDatasource,
};

export const CLIENT_DETAIL_STATS_COMPONENT: ComponentDefinition = {
  id: "Recruit.ClientDetailStats.Component",
  type: "COMPONENT",
  value: StatCardRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
