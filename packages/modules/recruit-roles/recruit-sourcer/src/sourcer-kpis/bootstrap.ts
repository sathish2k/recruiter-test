import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { StatCardRenderer } from "@recruit/shared";
import { SourcerKpisConfiguration } from "./sourcer-kpis.configuration";
import { sourcerKpisDatasource } from "./sourcer-kpis.datasource";
import fallbackTranslation from "./sourcer-kpis.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.Sourcer.DashboardStats.Configuration",
  type: "CONFIGURATION",
  value: SourcerKpisConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.Sourcer.DashboardStats.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.Sourcer.DashboardStats.Datasource",
  type: "DATASOURCE",
  value: sourcerKpisDatasource,
};

export const SOURCER_KPIS_COMPONENT: ComponentDefinition = {
  id: "Recruit.Sourcer.DashboardStats.Component",
  type: "COMPONENT",
  value: StatCardRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
