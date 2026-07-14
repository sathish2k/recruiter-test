import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { RecentCandidatesComponent } from "./recent-candidates.component";
import { RecentCandidatesConfiguration } from "./recent-candidates.configuration";
import { recentCandidatesDatasource } from "./recent-candidates.datasource";
import fallbackTranslation from "./recent-candidates.translations.json";

const RECENT_CANDIDATES_CONFIGURATION: ComponentDependency = {
  id: "Recruit.RecentCandidates.Configuration",
  type: "CONFIGURATION",
  value: RecentCandidatesConfiguration,
};

const RECENT_CANDIDATES_TRANSLATION: ComponentDependency = {
  id: "Recruit.RecentCandidates.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

const RECENT_CANDIDATES_DATASOURCE: ComponentDependency = {
  id: "Recruit.RecentCandidates.Datasource",
  type: "DATASOURCE",
  value: recentCandidatesDatasource,
};

export const RECENT_CANDIDATES_COMPONENT: ComponentDefinition = {
  id: "Recruit.RecentCandidates.Component",
  type: "COMPONENT",
  value: RecentCandidatesComponent,
  default: {
    configuration: RECENT_CANDIDATES_CONFIGURATION,
    translation: RECENT_CANDIDATES_TRANSLATION,
    datasource: RECENT_CANDIDATES_DATASOURCE,
  },
};
