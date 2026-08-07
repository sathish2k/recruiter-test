import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { SideListRenderer } from "@recruit/shared";
import { HiringManagerSideConfiguration } from "./hiring-manager-side.configuration";
import { hiringManagerSideDatasource } from "./hiring-manager-side.datasource";
import fallbackTranslation from "./hiring-manager-side.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.HiringManager.DashboardSide.Configuration",
  type: "CONFIGURATION",
  value: HiringManagerSideConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.HiringManager.DashboardSide.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.HiringManager.DashboardSide.Datasource",
  type: "DATASOURCE",
  value: hiringManagerSideDatasource,
};

export const HIRING_MANAGER_SIDE_COMPONENT: ComponentDefinition = {
  id: "Recruit.HiringManager.DashboardSide.Component",
  type: "COMPONENT",
  value: SideListRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
