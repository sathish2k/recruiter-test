import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { StatusChipsRenderer } from "@recruit/shared";
import { ClientStatusConfiguration } from "./client-status.configuration";
import { clientStatusDatasource } from "./client-status.datasource";
import fallbackTranslation from "./client-status.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.Client.DashboardStatus.Configuration",
  type: "CONFIGURATION",
  value: ClientStatusConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.Client.DashboardStatus.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.Client.DashboardStatus.Datasource",
  type: "DATASOURCE",
  value: clientStatusDatasource,
};

export const CLIENT_STATUS_COMPONENT: ComponentDefinition = {
  id: "Recruit.Client.DashboardStatus.Component",
  type: "COMPONENT",
  value: StatusChipsRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
