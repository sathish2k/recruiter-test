import type { Module } from "@recruit/sdk";
import { PIPELINE_BOARD_COMPONENT } from "./pipeline-board/bootstrap";

export const PipelineModule: Module = {
  id: "Pipeline.Module",
  components: [PIPELINE_BOARD_COMPONENT],
};
