import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { QueueCardRenderer } from "@recruit/shared";
import { ClientQueueConfiguration } from "./client-queue.configuration";
import { clientQueueDatasource } from "./client-queue.datasource";
import fallbackTranslation from "./client-queue.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.Client.DashboardQueue.Configuration",
  type: "CONFIGURATION",
  value: ClientQueueConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.Client.DashboardQueue.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.Client.DashboardQueue.Datasource",
  type: "DATASOURCE",
  value: clientQueueDatasource,
};

export const CLIENT_QUEUE_COMPONENT: ComponentDefinition = {
  id: "Recruit.Client.DashboardQueue.Component",
  type: "COMPONENT",
  value: QueueCardRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
