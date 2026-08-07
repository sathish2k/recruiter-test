import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { StatCardRenderer } from "@recruit/shared";
import { AdminKpisConfiguration } from "./admin-kpis.configuration";
import { adminKpisDatasource } from "./admin-kpis.datasource";
import fallbackTranslation from "./admin-kpis.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.Admin.DashboardStats.Configuration",
  type: "CONFIGURATION",
  value: AdminKpisConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.Admin.DashboardStats.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.Admin.DashboardStats.Datasource",
  type: "DATASOURCE",
  value: adminKpisDatasource,
};

export const ADMIN_KPIS_COMPONENT: ComponentDefinition = {
  id: "Recruit.Admin.DashboardStats.Component",
  type: "COMPONENT",
  value: StatCardRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
