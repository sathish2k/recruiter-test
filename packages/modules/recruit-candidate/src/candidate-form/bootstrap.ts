import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { CandidateFormComponent } from "./candidate-form.component";
import { CandidateFormConfiguration } from "./candidate-form.configuration";
import { candidateFormDatasource } from "./candidate-form.datasource";
import fallbackTranslation from "./candidate-form.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.CandidateForm.Configuration",
  type: "CONFIGURATION",
  value: CandidateFormConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.CandidateForm.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.CandidateForm.Datasource",
  type: "DATASOURCE",
  value: candidateFormDatasource,
};

export const CANDIDATE_FORM_COMPONENT: ComponentDefinition = {
  id: "Recruit.CandidateForm.Component",
  type: "COMPONENT",
  value: CandidateFormComponent,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
