import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { TableFilterExportRenderer } from "@recruit/shared";
import { CandidatesConfiguration } from "./candidates.configuration";
import { candidatesDatasource } from "./candidates.datasource";
import fallbackTranslation from "./candidates.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.Candidates.Configuration",
  type: "CONFIGURATION",
  value: CandidatesConfiguration,
};

const TRANSLATION: ComponentDependency = {
  id: "Recruit.Candidates.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

const DATASOURCE: ComponentDependency = {
  id: "Recruit.Candidates.Datasource",
  type: "DATASOURCE",
  value: candidatesDatasource,
};

export const CANDIDATES_COMPONENT: ComponentDefinition = {
  id: "Recruit.Candidates.Component",
  type: "COMPONENT",
  value: TableFilterExportRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
