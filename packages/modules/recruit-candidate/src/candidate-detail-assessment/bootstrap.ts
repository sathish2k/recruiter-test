import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { CandidateDetailAssessmentComponent } from "./candidate-detail-assessment.component";
import { candidateDetailAssessmentDatasource } from "./candidate-detail-assessment.datasource";
import fallbackTranslation from "./candidate-detail-assessment.translations.json";

const TRANSLATION: ComponentDependency = {
  id: "Recruit.CandidateDetailAssessment.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.CandidateDetailAssessment.Datasource",
  type: "DATASOURCE",
  value: candidateDetailAssessmentDatasource,
};

export const CANDIDATE_DETAIL_ASSESSMENT_COMPONENT: ComponentDefinition = {
  id: "Recruit.CandidateDetailAssessment.Component",
  type: "COMPONENT",
  value: CandidateDetailAssessmentComponent,
  default: {
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
