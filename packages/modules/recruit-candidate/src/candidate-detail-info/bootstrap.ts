import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { CandidateDetailInfoComponent } from "./candidate-detail-info.component";
import { CandidateDetailInfoConfiguration } from "./candidate-detail-info.configuration";
import { candidateDetailInfoDatasource } from "./candidate-detail-info.datasource";
import fallbackTranslation from "./candidate-detail-info.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.CandidateDetailInfo.Configuration",
  type: "CONFIGURATION",
  value: CandidateDetailInfoConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.CandidateDetailInfo.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.CandidateDetailInfo.Datasource",
  type: "DATASOURCE",
  value: candidateDetailInfoDatasource,
};

export const CANDIDATE_DETAIL_INFO_COMPONENT: ComponentDefinition = {
  id: "Recruit.CandidateDetailInfo.Component",
  type: "COMPONENT",
  value: CandidateDetailInfoComponent,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
