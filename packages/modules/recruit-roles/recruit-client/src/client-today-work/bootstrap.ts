import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { TodayWorkRenderer } from "@recruit/shared";
import { ClientTodayWorkConfiguration } from "./client-today-work.configuration";
import { clientTodayWorkDatasource } from "./client-today-work.datasource";
import fallbackTranslation from "./client-today-work.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.Client.DashboardTodayWork.Configuration",
  type: "CONFIGURATION",
  value: ClientTodayWorkConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.Client.DashboardTodayWork.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.Client.DashboardTodayWork.Datasource",
  type: "DATASOURCE",
  value: clientTodayWorkDatasource,
};

export const CLIENT_TODAY_WORK_COMPONENT: ComponentDefinition = {
  id: "Recruit.Client.DashboardTodayWork.Component",
  type: "COMPONENT",
  value: TodayWorkRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
