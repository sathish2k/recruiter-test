import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { ClientStatsComponent } from "./client-stats.component";
import { ClientStatsConfiguration } from "./client-stats.configuration";
import { clientStatsDatasource } from "./client-stats.datasource";
import fallbackTranslation from "./client-stats.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.ClientStats.Configuration",
  type: "CONFIGURATION",
  value: ClientStatsConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.ClientStats.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.ClientStats.Datasource",
  type: "DATASOURCE",
  value: clientStatsDatasource,
};

export const CLIENT_STATS_COMPONENT: ComponentDefinition = {
  id: "Recruit.ClientStats.Component",
  type: "COMPONENT",
  value: ClientStatsComponent,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
