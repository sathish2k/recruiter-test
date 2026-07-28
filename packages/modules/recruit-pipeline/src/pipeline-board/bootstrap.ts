import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { PipelineBoardComponent } from "./pipeline-board.component";
import { PipelineBoardConfiguration } from "./pipeline-board.configuration";
import { pipelineBoardDatasource } from "./pipeline-board.datasource";
import fallbackTranslation from "./pipeline-board.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.PipelineBoard.Configuration",
  type: "CONFIGURATION",
  value: PipelineBoardConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.PipelineBoard.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.PipelineBoard.Datasource",
  type: "DATASOURCE",
  value: pipelineBoardDatasource,
};

export const PIPELINE_BOARD_COMPONENT: ComponentDefinition = {
  id: "Recruit.PipelineBoard.Component",
  type: "COMPONENT",
  value: PipelineBoardComponent,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
