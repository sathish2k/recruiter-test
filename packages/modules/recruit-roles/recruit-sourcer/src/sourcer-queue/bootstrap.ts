import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { QueueCardRenderer } from "@recruit/shared";
import { SourcerQueueConfiguration } from "./sourcer-queue.configuration";
import { sourcerQueueDatasource } from "./sourcer-queue.datasource";
import fallbackTranslation from "./sourcer-queue.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.Sourcer.DashboardQueue.Configuration",
  type: "CONFIGURATION",
  value: SourcerQueueConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.Sourcer.DashboardQueue.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.Sourcer.DashboardQueue.Datasource",
  type: "DATASOURCE",
  value: sourcerQueueDatasource,
};

export const SOURCER_QUEUE_COMPONENT: ComponentDefinition = {
  id: "Recruit.Sourcer.DashboardQueue.Component",
  type: "COMPONENT",
  value: QueueCardRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
