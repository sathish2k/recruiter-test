import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { ToolbarComponent } from "./toolbar.component";
import { ToolbarConfig } from "./toolbar.configuration";
import { toolbarDatasource } from "./toolbar.datasource";
import fallbackTranslation from "./toolbar.translations.json";

const TOOLBAR_CONFIGURATION: ComponentDependency = {
  id: "Recruit.DashboardToolbar.Configuration",
  type: "CONFIGURATION",
  value: ToolbarConfig,
};

const TOOLBAR_TRANSLATION: ComponentDependency = {
  id: "Recruit.DashboardToolbar.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

const TOOLBAR_DATASOURCE: ComponentDependency = {
  id: "Recruit.DashboardToolbar.Datasource",
  type: "DATASOURCE",
  value: toolbarDatasource,
};

export const DASHBOARD_TOOLBAR_COMPONENT: ComponentDefinition = {
  id: "Recruit.DashboardToolbar.Component",
  type: "COMPONENT",
  value: ToolbarComponent,
  default: {
    configuration: TOOLBAR_CONFIGURATION,
    translation: TOOLBAR_TRANSLATION,
    datasource: TOOLBAR_DATASOURCE,
  },
};
