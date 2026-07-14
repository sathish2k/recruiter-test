import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { CandidateDetailComponent } from "./candidate-detail.component";
import { CandidateDetailConfiguration } from "./candidate-detail.configuration";
import { candidateDetailDatasource } from "./candidate-detail.datasource";
import fallbackTranslation from "./candidate-detail.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.CandidateDetail.Configuration",
  type: "CONFIGURATION",
  value: CandidateDetailConfiguration,
};

const TRANSLATION: ComponentDependency = {
  id: "Recruit.CandidateDetail.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

const DATASOURCE: ComponentDependency = {
  id: "Recruit.CandidateDetail.Datasource",
  type: "DATASOURCE",
  value: candidateDetailDatasource,
};

export const CANDIDATE_DETAIL_COMPONENT: ComponentDefinition = {
  id: "Recruit.CandidateDetail.Component",
  type: "COMPONENT",
  value: CandidateDetailComponent,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
