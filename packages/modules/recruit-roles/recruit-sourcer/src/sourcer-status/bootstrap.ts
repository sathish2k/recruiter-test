import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { StatusChipsRenderer } from "@recruit/shared";
import { SourcerStatusConfiguration } from "./sourcer-status.configuration";
import { sourcerStatusDatasource } from "./sourcer-status.datasource";
import fallbackTranslation from "./sourcer-status.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.Sourcer.DashboardStatus.Configuration",
  type: "CONFIGURATION",
  value: SourcerStatusConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.Sourcer.DashboardStatus.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.Sourcer.DashboardStatus.Datasource",
  type: "DATASOURCE",
  value: sourcerStatusDatasource,
};

export const SOURCER_STATUS_COMPONENT: ComponentDefinition = {
  id: "Recruit.Sourcer.DashboardStatus.Component",
  type: "COMPONENT",
  value: StatusChipsRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
