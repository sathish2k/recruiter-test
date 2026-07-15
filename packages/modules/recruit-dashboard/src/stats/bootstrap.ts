import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { StatCardRenderer } from "@recruit/shared";
import { StatsConfiguration } from "./stats.configuration";
import { statsDatasource } from "./stats.datasource";
import fallbackTranslation from "./stats.translations.json";

const STATS_CONFIGURATION: ComponentDependency = {
  id: "Recruit.Stats.Configuration",
  type: "CONFIGURATION",
  value: StatsConfiguration,
};

const STATS_TRANSLATION: ComponentDependency = {
  id: "Recruit.Stats.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

const STATS_DATASOURCE: ComponentDependency = {
  id: "Recruit.Stats.Datasource",
  type: "DATASOURCE",
  value: statsDatasource,
};

export const STATS_COMPONENT: ComponentDefinition = {
  id: "Recruit.Stats.Component",
  type: "COMPONENT",
  value: StatCardRenderer,
  default: {
    configuration: STATS_CONFIGURATION,
    translation: STATS_TRANSLATION,
    datasource: STATS_DATASOURCE,
  },
};
