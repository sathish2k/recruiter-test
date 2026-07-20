import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { SettingsWorkspaceComponent } from "./workspace.component";
import { WorkspaceConfiguration } from "./workspace.configuration";
import { organizationDatasource } from "./workspace.datasource";
import fallbackTranslation from "./workspace.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.SettingsWorkspace.Configuration",
  type: "CONFIGURATION",
  value: WorkspaceConfiguration,
};

const TRANSLATION: ComponentDependency = {
  id: "Recruit.SettingsWorkspace.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

const DATASOURCE: ComponentDependency = {
  id: "Recruit.SettingsWorkspace.Datasource",
  type: "DATASOURCE",
  value: organizationDatasource,
};

export const SETTINGS_WORKSPACE_COMPONENT: ComponentDefinition = {
  id: "Recruit.SettingsWorkspace.Component",
  type: "COMPONENT",
  value: SettingsWorkspaceComponent,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
