import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { TodayWorkRenderer } from "@recruit/shared";
import { OwnerTodayWorkConfiguration } from "./owner-today-work.configuration";
import { ownerTodayWorkDatasource } from "./owner-today-work.datasource";
import fallbackTranslation from "./owner-today-work.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.Owner.DashboardTodayWork.Configuration",
  type: "CONFIGURATION",
  value: OwnerTodayWorkConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.Owner.DashboardTodayWork.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.Owner.DashboardTodayWork.Datasource",
  type: "DATASOURCE",
  value: ownerTodayWorkDatasource,
};

export const OWNER_TODAY_WORK_COMPONENT: ComponentDefinition = {
  id: "Recruit.Owner.DashboardTodayWork.Component",
  type: "COMPONENT",
  value: TodayWorkRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
