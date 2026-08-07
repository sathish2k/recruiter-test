import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { HealthCardRenderer } from "@recruit/shared";
import { AdminSystemConfiguration } from "./admin-system.configuration";
import { adminSystemDatasource } from "./admin-system.datasource";
import fallbackTranslation from "./admin-system.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.Admin.DashboardSystem.Configuration",
  type: "CONFIGURATION",
  value: AdminSystemConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.Admin.DashboardSystem.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.Admin.DashboardSystem.Datasource",
  type: "DATASOURCE",
  value: adminSystemDatasource,
};

export const ADMIN_SYSTEM_COMPONENT: ComponentDefinition = {
  id: "Recruit.Admin.DashboardSystem.Component",
  type: "COMPONENT",
  value: HealthCardRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
