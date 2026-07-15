import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { PipelineComponent } from "./pipeline.component";
import { PipelineConfiguration } from "./pipeline.configuration";
import { pipelineDatasource } from "./pipeline.datasource";
import fallbackTranslation from "./pipeline.translations.json";

const PIPELINE_CONFIGURATION: ComponentDependency = {
  id: "Recruit.Pipeline.Configuration",
  type: "CONFIGURATION",
  value: PipelineConfiguration,
};

const PIPELINE_TRANSLATION: ComponentDependency = {
  id: "Recruit.Pipeline.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

const PIPELINE_DATASOURCE: ComponentDependency = {
  id: "Recruit.Pipeline.Datasource",
  type: "DATASOURCE",
  value: pipelineDatasource,
};

export const PIPELINE_COMPONENT: ComponentDefinition = {
  id: "Recruit.Pipeline.Component",
  type: "COMPONENT",
  value: PipelineComponent,
  default: {
    configuration: PIPELINE_CONFIGURATION,
    translation: PIPELINE_TRANSLATION,
    datasource: PIPELINE_DATASOURCE,
  },
};
