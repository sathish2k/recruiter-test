import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { StageStripRenderer } from "@recruit/shared";
import { JobDetailPipelineConfiguration } from "./job-detail-pipeline.configuration";
import { jobDetailPipelineDatasource } from "./job-detail-pipeline.datasource";
import fallbackTranslation from "./job-detail-pipeline.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.JobDetailPipeline.Configuration",
  type: "CONFIGURATION",
  value: JobDetailPipelineConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.JobDetailPipeline.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.JobDetailPipeline.Datasource",
  type: "DATASOURCE",
  value: jobDetailPipelineDatasource,
};

export const JOB_DETAIL_PIPELINE_COMPONENT: ComponentDefinition = {
  id: "Recruit.JobDetailPipeline.Component",
  type: "COMPONENT",
  value: StageStripRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
