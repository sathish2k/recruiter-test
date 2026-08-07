import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { QueueCardRenderer } from "@recruit/shared";
import { AdminQueueConfiguration } from "./admin-queue.configuration";
import { adminQueueDatasource } from "./admin-queue.datasource";
import fallbackTranslation from "./admin-queue.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.Admin.DashboardQueue.Configuration",
  type: "CONFIGURATION",
  value: AdminQueueConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.Admin.DashboardQueue.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.Admin.DashboardQueue.Datasource",
  type: "DATASOURCE",
  value: adminQueueDatasource,
};

export const ADMIN_QUEUE_COMPONENT: ComponentDefinition = {
  id: "Recruit.Admin.DashboardQueue.Component",
  type: "COMPONENT",
  value: QueueCardRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
