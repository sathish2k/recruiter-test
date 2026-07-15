import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { LeadCvQueueComponent } from "./lead-cv-queue.component";
import { LeadCvQueueConfiguration } from "./lead-cv-queue.configuration";
import { leadCvQueueDatasource } from "./lead-cv-queue.datasource";
import fallbackTranslation from "./lead-cv-queue.translations.json";

const LEAD_CV_QUEUE_CONFIGURATION: ComponentDependency = {
  id: "Recruit.LeadCvQueue.Configuration",
  type: "CONFIGURATION",
  value: LeadCvQueueConfiguration,
};

const LEAD_CV_QUEUE_TRANSLATION: ComponentDependency = {
  id: "Recruit.LeadCvQueue.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

const LEAD_CV_QUEUE_DATASOURCE: ComponentDependency = {
  id: "Recruit.LeadCvQueue.Datasource",
  type: "DATASOURCE",
  value: leadCvQueueDatasource,
};

export const LEAD_CV_QUEUE_COMPONENT: ComponentDefinition = {
  id: "Recruit.LeadCvQueue.Component",
  type: "COMPONENT",
  value: LeadCvQueueComponent,
  default: {
    configuration: LEAD_CV_QUEUE_CONFIGURATION,
    translation: LEAD_CV_QUEUE_TRANSLATION,
    datasource: LEAD_CV_QUEUE_DATASOURCE,
  },
};
