import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { TabbedWorkspaceRenderer } from "@recruit/shared";
import { CandidateDetailWorkspaceConfiguration } from "./candidate-detail-workspace.configuration";
import { candidateDetailWorkspaceDatasource } from "./candidate-detail-workspace.datasource";
import fallbackTranslation from "./candidate-detail-workspace.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.CandidateDetailWorkspace.Configuration",
  type: "CONFIGURATION",
  value: CandidateDetailWorkspaceConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.CandidateDetailWorkspace.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.CandidateDetailWorkspace.Datasource",
  type: "DATASOURCE",
  value: candidateDetailWorkspaceDatasource,
};

export const CANDIDATE_DETAIL_WORKSPACE_COMPONENT: ComponentDefinition = {
  id: "Recruit.CandidateDetailWorkspace.Component",
  type: "COMPONENT",
  value: TabbedWorkspaceRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
