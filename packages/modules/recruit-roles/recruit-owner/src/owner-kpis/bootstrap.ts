import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { StatCardRenderer } from "@recruit/shared";
import { OwnerKpisConfiguration } from "./owner-kpis.configuration";
import { ownerKpisDatasource } from "./owner-kpis.datasource";
import fallbackTranslation from "./owner-kpis.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.Owner.DashboardStats.Configuration",
  type: "CONFIGURATION",
  value: OwnerKpisConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.Owner.DashboardStats.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.Owner.DashboardStats.Datasource",
  type: "DATASOURCE",
  value: ownerKpisDatasource,
};

export const OWNER_KPIS_COMPONENT: ComponentDefinition = {
  id: "Recruit.Owner.DashboardStats.Component",
  type: "COMPONENT",
  value: StatCardRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
