import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { TodayWorkRenderer } from "@recruit/shared";
import { SourcerTodayWorkConfiguration } from "./sourcer-today-work.configuration";
import { sourcerTodayWorkDatasource } from "./sourcer-today-work.datasource";
import fallbackTranslation from "./sourcer-today-work.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.Sourcer.DashboardTodayWork.Configuration",
  type: "CONFIGURATION",
  value: SourcerTodayWorkConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.Sourcer.DashboardTodayWork.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.Sourcer.DashboardTodayWork.Datasource",
  type: "DATASOURCE",
  value: sourcerTodayWorkDatasource,
};

export const SOURCER_TODAY_WORK_COMPONENT: ComponentDefinition = {
  id: "Recruit.Sourcer.DashboardTodayWork.Component",
  type: "COMPONENT",
  value: TodayWorkRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
