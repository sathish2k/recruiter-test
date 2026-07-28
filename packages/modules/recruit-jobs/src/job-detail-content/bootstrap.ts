import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { CollapsibleSectionsRenderer } from "@recruit/shared";
import { JobDetailContentConfiguration } from "./job-detail-content.configuration";
import { jobDetailContentDatasource } from "./job-detail-content.datasource";
import fallbackTranslation from "./job-detail-content.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.JobDetailContent.Configuration",
  type: "CONFIGURATION",
  value: JobDetailContentConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.JobDetailContent.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.JobDetailContent.Datasource",
  type: "DATASOURCE",
  value: jobDetailContentDatasource,
};

export const JOB_DETAIL_CONTENT_COMPONENT: ComponentDefinition = {
  id: "Recruit.JobDetailContent.Component",
  type: "COMPONENT",
  value: CollapsibleSectionsRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
