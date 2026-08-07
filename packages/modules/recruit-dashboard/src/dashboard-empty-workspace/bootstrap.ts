import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { EmptyWorkspaceRenderer } from "@recruit/shared";
import { DashboardEmptyWorkspaceConfiguration } from "./dashboard-empty-workspace.configuration";
import { dashboardEmptyWorkspaceDatasource } from "./dashboard-empty-workspace.datasource";
import fallbackTranslation from "./dashboard-empty-workspace.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.DashboardEmptyWorkspace.Configuration",
  type: "CONFIGURATION",
  value: DashboardEmptyWorkspaceConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.DashboardEmptyWorkspace.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.DashboardEmptyWorkspace.Datasource",
  type: "DATASOURCE",
  value: dashboardEmptyWorkspaceDatasource,
};

export const DASHBOARD_EMPTY_WORKSPACE_COMPONENT: ComponentDefinition = {
  id: "Recruit.DashboardEmptyWorkspace.Component",
  type: "COMPONENT",
  value: EmptyWorkspaceRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
