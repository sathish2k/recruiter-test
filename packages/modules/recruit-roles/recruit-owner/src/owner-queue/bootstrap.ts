import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { QueueCardRenderer } from "@recruit/shared";
import { OwnerQueueConfiguration } from "./owner-queue.configuration";
import { ownerQueueDatasource } from "./owner-queue.datasource";
import fallbackTranslation from "./owner-queue.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.Owner.DashboardQueue.Configuration",
  type: "CONFIGURATION",
  value: OwnerQueueConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.Owner.DashboardQueue.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.Owner.DashboardQueue.Datasource",
  type: "DATASOURCE",
  value: ownerQueueDatasource,
};

export const OWNER_QUEUE_COMPONENT: ComponentDefinition = {
  id: "Recruit.Owner.DashboardQueue.Component",
  type: "COMPONENT",
  value: QueueCardRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
