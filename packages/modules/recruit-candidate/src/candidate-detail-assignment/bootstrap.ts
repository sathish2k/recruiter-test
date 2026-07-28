import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { CandidateDetailAssignmentComponent } from "./candidate-detail-assignment.component";
import { CandidateDetailAssignmentConfiguration } from "./candidate-detail-assignment.configuration";
import { candidateDetailAssignmentDatasource } from "./candidate-detail-assignment.datasource";
import fallbackTranslation from "./candidate-detail-assignment.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.CandidateDetailAssignment.Configuration",
  type: "CONFIGURATION",
  value: CandidateDetailAssignmentConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.CandidateDetailAssignment.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.CandidateDetailAssignment.Datasource",
  type: "DATASOURCE",
  value: candidateDetailAssignmentDatasource,
};

export const CANDIDATE_DETAIL_ASSIGNMENT_COMPONENT: ComponentDefinition = {
  id: "Recruit.CandidateDetailAssignment.Component",
  type: "COMPONENT",
  value: CandidateDetailAssignmentComponent,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
