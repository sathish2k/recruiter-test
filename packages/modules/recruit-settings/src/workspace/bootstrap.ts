import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { SettingsWorkspaceComponent } from "./workspace.component";
import { organizationDatasource } from "./workspace.datasource";

const DATASOURCE: ComponentDependency = {
  id: "Recruit.SettingsWorkspace.Datasource",
  type: "DATASOURCE",
  value: organizationDatasource,
};

export const SETTINGS_WORKSPACE_COMPONENT: ComponentDefinition = {
  id: "Recruit.SettingsWorkspace.Component",
  type: "COMPONENT",
  value: SettingsWorkspaceComponent,
  default: { datasource: DATASOURCE },
};
