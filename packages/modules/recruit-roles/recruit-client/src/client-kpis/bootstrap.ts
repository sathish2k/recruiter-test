import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { StatCardRenderer } from "@recruit/shared";
import { ClientKpisConfiguration } from "./client-kpis.configuration";
import { clientKpisDatasource } from "./client-kpis.datasource";
import fallbackTranslation from "./client-kpis.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.Client.DashboardStats.Configuration",
  type: "CONFIGURATION",
  value: ClientKpisConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.Client.DashboardStats.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.Client.DashboardStats.Datasource",
  type: "DATASOURCE",
  value: clientKpisDatasource,
};

export const CLIENT_KPIS_COMPONENT: ComponentDefinition = {
  id: "Recruit.Client.DashboardStats.Component",
  type: "COMPONENT",
  value: StatCardRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
