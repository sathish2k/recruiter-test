import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { AddCandidateComponent } from "./add-candidate.component";
import { AddCandidateConfiguration } from "./add-candidate.configuration";
import { addCandidateDatasource } from "./add-candidate.datasource";
import fallbackTranslation from "./add-candidate.translations.json";

const ADD_CANDIDATE_CONFIGURATION: ComponentDependency = {
  id: "Recruit.AddCandidate.Configuration",
  type: "CONFIGURATION",
  value: AddCandidateConfiguration,
};

const ADD_CANDIDATE_TRANSLATION: ComponentDependency = {
  id: "Recruit.AddCandidate.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

const ADD_CANDIDATE_DATASOURCE: ComponentDependency = {
  id: "Recruit.AddCandidate.Datasource",
  type: "DATASOURCE",
  value: addCandidateDatasource,
};

export const ADD_CANDIDATE_COMPONENT: ComponentDefinition = {
  id: "Recruit.AddCandidate.Component",
  type: "COMPONENT",
  value: AddCandidateComponent,
  default: {
    configuration: ADD_CANDIDATE_CONFIGURATION,
    translation: ADD_CANDIDATE_TRANSLATION,
    datasource: ADD_CANDIDATE_DATASOURCE,
  },
};
