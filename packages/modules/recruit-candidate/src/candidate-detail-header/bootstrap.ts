import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { CandidateDetailHeaderComponent } from "./candidate-detail-header.component";
import { CandidateDetailHeaderConfiguration } from "./candidate-detail-header.configuration";
import { candidateDetailHeaderDatasource } from "./candidate-detail-header.datasource";
import fallbackTranslation from "./candidate-detail-header.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.CandidateDetailHeader.Configuration",
  type: "CONFIGURATION",
  value: CandidateDetailHeaderConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.CandidateDetailHeader.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.CandidateDetailHeader.Datasource",
  type: "DATASOURCE",
  value: candidateDetailHeaderDatasource,
};

export const CANDIDATE_DETAIL_HEADER_COMPONENT: ComponentDefinition = {
  id: "Recruit.CandidateDetailHeader.Component",
  type: "COMPONENT",
  value: CandidateDetailHeaderComponent,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
