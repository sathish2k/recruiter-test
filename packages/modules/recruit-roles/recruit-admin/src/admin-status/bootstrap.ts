import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { StatusChipsRenderer } from "@recruit/shared";
import { AdminStatusConfiguration } from "./admin-status.configuration";
import { adminStatusDatasource } from "./admin-status.datasource";
import fallbackTranslation from "./admin-status.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.Admin.DashboardStatus.Configuration",
  type: "CONFIGURATION",
  value: AdminStatusConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.Admin.DashboardStatus.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.Admin.DashboardStatus.Datasource",
  type: "DATASOURCE",
  value: adminStatusDatasource,
};

export const ADMIN_STATUS_COMPONENT: ComponentDefinition = {
  id: "Recruit.Admin.DashboardStatus.Component",
  type: "COMPONENT",
  value: StatusChipsRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
