import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { StatCardRenderer } from "@recruit/shared";
import { CandidateStatsConfiguration } from "./candidate-stats.configuration";
import { candidateStatsDatasource } from "./candidate-stats.datasource";
import fallbackTranslation from "./candidate-stats.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.CandidateStats.Configuration",
  type: "CONFIGURATION",
  value: CandidateStatsConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.CandidateStats.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.CandidateStats.Datasource",
  type: "DATASOURCE",
  value: candidateStatsDatasource,
};

export const CANDIDATE_STATS_COMPONENT: ComponentDefinition = {
  id: "Recruit.CandidateStats.Component",
  type: "COMPONENT",
  value: StatCardRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
