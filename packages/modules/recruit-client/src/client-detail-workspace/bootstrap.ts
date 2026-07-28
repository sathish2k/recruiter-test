import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { ClientDetailWorkspaceComponent } from "./client-detail-workspace.component";
import { ClientDetailWorkspaceConfiguration } from "./client-detail-workspace.configuration";
import { clientDetailWorkspaceDatasource } from "./client-detail-workspace.datasource";
import fallbackTranslation from "./client-detail-workspace.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.ClientDetailWorkspace.Configuration",
  type: "CONFIGURATION",
  value: ClientDetailWorkspaceConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.ClientDetailWorkspace.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.ClientDetailWorkspace.Datasource",
  type: "DATASOURCE",
  value: clientDetailWorkspaceDatasource,
};

export const CLIENT_DETAIL_WORKSPACE_COMPONENT: ComponentDefinition = {
  id: "Recruit.ClientDetailWorkspace.Component",
  type: "COMPONENT",
  value: ClientDetailWorkspaceComponent,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
