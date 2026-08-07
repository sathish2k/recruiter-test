import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { permissionsDatasource } from "../permissions/permissions.datasource";
import { RolesSummaryComponent } from "./roles-summary.component";
import { RolesSummaryConfiguration } from "./roles-summary.configuration";
import fallbackTranslation from "./roles-summary.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.RolesSummary.Configuration",
  type: "CONFIGURATION",
  value: RolesSummaryConfiguration,
};

const TRANSLATION: ComponentDependency = {
  id: "Recruit.RolesSummary.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

// The holder counts ride in this endpoint's `meta`, the same numbers the
// permission matrix's role cards print.
const DATASOURCE: ComponentDependency = {
  id: "Recruit.RolesSummary.Datasource",
  type: "DATASOURCE",
  value: permissionsDatasource,
};

export const ROLES_SUMMARY_COMPONENT: ComponentDefinition = {
  id: "Recruit.RolesSummary.Component",
  type: "COMPONENT",
  value: RolesSummaryComponent,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
