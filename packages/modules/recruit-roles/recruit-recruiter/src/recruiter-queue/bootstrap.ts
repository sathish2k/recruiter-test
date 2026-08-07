import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { QueueCardRenderer } from "@recruit/shared";
import { RecruiterQueueConfiguration } from "./recruiter-queue.configuration";
import { recruiterQueueDatasource } from "./recruiter-queue.datasource";
import fallbackTranslation from "./recruiter-queue.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.Recruiter.DashboardQueue.Configuration",
  type: "CONFIGURATION",
  value: RecruiterQueueConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.Recruiter.DashboardQueue.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.Recruiter.DashboardQueue.Datasource",
  type: "DATASOURCE",
  value: recruiterQueueDatasource,
};

export const RECRUITER_QUEUE_COMPONENT: ComponentDefinition = {
  id: "Recruit.Recruiter.DashboardQueue.Component",
  type: "COMPONENT",
  value: QueueCardRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
