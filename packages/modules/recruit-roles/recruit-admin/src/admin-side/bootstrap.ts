import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { SideListRenderer } from "@recruit/shared";
import { AdminSideConfiguration } from "./admin-side.configuration";
import { adminSideDatasource } from "./admin-side.datasource";
import fallbackTranslation from "./admin-side.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.Admin.DashboardSide.Configuration",
  type: "CONFIGURATION",
  value: AdminSideConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.Admin.DashboardSide.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.Admin.DashboardSide.Datasource",
  type: "DATASOURCE",
  value: adminSideDatasource,
};

export const ADMIN_SIDE_COMPONENT: ComponentDefinition = {
  id: "Recruit.Admin.DashboardSide.Component",
  type: "COMPONENT",
  value: SideListRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
