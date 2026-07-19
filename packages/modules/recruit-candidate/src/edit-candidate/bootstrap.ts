import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { EditCandidateComponent } from "./edit-candidate.component";
import { EditCandidateConfiguration } from "./edit-candidate.configuration";
import { editCandidateDatasource } from "./edit-candidate.datasource";
import fallbackTranslation from "./edit-candidate.translations.json";

const EDIT_CANDIDATE_CONFIGURATION: ComponentDependency = {
  id: "Recruit.EditCandidate.Configuration",
  type: "CONFIGURATION",
  value: EditCandidateConfiguration,
};

const EDIT_CANDIDATE_TRANSLATION: ComponentDependency = {
  id: "Recruit.EditCandidate.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

const EDIT_CANDIDATE_DATASOURCE: ComponentDependency = {
  id: "Recruit.EditCandidate.Datasource",
  type: "DATASOURCE",
  value: editCandidateDatasource,
};

export const EDIT_CANDIDATE_COMPONENT: ComponentDefinition = {
  id: "Recruit.EditCandidate.Component",
  type: "COMPONENT",
  value: EditCandidateComponent,
  default: {
    configuration: EDIT_CANDIDATE_CONFIGURATION,
    translation: EDIT_CANDIDATE_TRANSLATION,
    datasource: EDIT_CANDIDATE_DATASOURCE,
  },
};
