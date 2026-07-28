import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { CandidateDetailExperienceComponent } from "./candidate-detail-experience.component";
import { candidateDetailExperienceDatasource } from "./candidate-detail-experience.datasource";
import fallbackTranslation from "./candidate-detail-experience.translations.json";

const TRANSLATION: ComponentDependency = {
  id: "Recruit.CandidateDetailExperience.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.CandidateDetailExperience.Datasource",
  type: "DATASOURCE",
  value: candidateDetailExperienceDatasource,
};

export const CANDIDATE_DETAIL_EXPERIENCE_COMPONENT: ComponentDefinition = {
  id: "Recruit.CandidateDetailExperience.Component",
  type: "COMPONENT",
  value: CandidateDetailExperienceComponent,
  default: {
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
