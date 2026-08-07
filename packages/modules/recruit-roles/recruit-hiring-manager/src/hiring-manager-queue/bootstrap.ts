import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { QueueCardRenderer } from "@recruit/shared";
import { HiringManagerQueueConfiguration } from "./hiring-manager-queue.configuration";
import { hiringManagerQueueDatasource } from "./hiring-manager-queue.datasource";
import fallbackTranslation from "./hiring-manager-queue.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.HiringManager.DashboardQueue.Configuration",
  type: "CONFIGURATION",
  value: HiringManagerQueueConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.HiringManager.DashboardQueue.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.HiringManager.DashboardQueue.Datasource",
  type: "DATASOURCE",
  value: hiringManagerQueueDatasource,
};

export const HIRING_MANAGER_QUEUE_COMPONENT: ComponentDefinition = {
  id: "Recruit.HiringManager.DashboardQueue.Component",
  type: "COMPONENT",
  value: QueueCardRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
