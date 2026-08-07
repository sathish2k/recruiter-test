import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { TableRenderer } from "@recruit/shared";
import { OwnerClientHealthConfiguration } from "./owner-client-health.configuration";
import { ownerClientHealthDatasource } from "./owner-client-health.datasource";
import fallbackTranslation from "./owner-client-health.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.Owner.DashboardClientHealth.Configuration",
  type: "CONFIGURATION",
  value: OwnerClientHealthConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.Owner.DashboardClientHealth.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.Owner.DashboardClientHealth.Datasource",
  type: "DATASOURCE",
  value: ownerClientHealthDatasource,
};

export const OWNER_CLIENT_HEALTH_COMPONENT: ComponentDefinition = {
  id: "Recruit.Owner.DashboardClientHealth.Component",
  type: "COMPONENT",
  value: TableRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
