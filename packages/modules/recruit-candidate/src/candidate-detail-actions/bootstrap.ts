import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { CandidateDetailActionsComponent } from "./candidate-detail-actions.component";
import { CandidateDetailActionsConfiguration } from "./candidate-detail-actions.configuration";
import { candidateDetailActionsDatasource } from "./candidate-detail-actions.datasource";
import fallbackTranslation from "./candidate-detail-actions.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.CandidateDetailActions.Configuration",
  type: "CONFIGURATION",
  value: CandidateDetailActionsConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.CandidateDetailActions.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.CandidateDetailActions.Datasource",
  type: "DATASOURCE",
  value: candidateDetailActionsDatasource,
};

export const CANDIDATE_DETAIL_ACTIONS_COMPONENT: ComponentDefinition = {
  id: "Recruit.CandidateDetailActions.Component",
  type: "COMPONENT",
  value: CandidateDetailActionsComponent,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
