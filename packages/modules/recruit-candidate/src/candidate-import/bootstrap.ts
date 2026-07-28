import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { CandidateImportComponent } from "./candidate-import.component";
import { CandidateImportConfiguration } from "./candidate-import.configuration";
import { candidateImportDatasource } from "./candidate-import.datasource";
import fallbackTranslation from "./candidate-import.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.CandidateImport.Configuration",
  type: "CONFIGURATION",
  value: CandidateImportConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.CandidateImport.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.CandidateImport.Datasource",
  type: "DATASOURCE",
  value: candidateImportDatasource,
};

export const CANDIDATE_IMPORT_COMPONENT: ComponentDefinition = {
  id: "Recruit.CandidateImport.Component",
  type: "COMPONENT",
  value: CandidateImportComponent,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
