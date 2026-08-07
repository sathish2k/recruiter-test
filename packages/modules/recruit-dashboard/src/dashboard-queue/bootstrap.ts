import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { QueueCardRenderer } from "@recruit/shared";
import { DashboardQueueConfiguration } from "./dashboard-queue.configuration";
import { dashboardDashboardQueueDatasource } from "./dashboard-queue.datasource";
import fallbackTranslation from "./dashboard-queue.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.DashboardQueue.Configuration",
  type: "CONFIGURATION",
  value: DashboardQueueConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.DashboardQueue.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.DashboardQueue.Datasource",
  type: "DATASOURCE",
  value: dashboardDashboardQueueDatasource,
};

export const DASHBOARD_QUEUE_COMPONENT: ComponentDefinition = {
  id: "Recruit.DashboardQueue.Component",
  type: "COMPONENT",
  value: QueueCardRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
