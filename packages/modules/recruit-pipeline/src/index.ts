import type { Module } from "@recruit/sdk";
import { PIPELINE_COMPONENT } from "./pipeline/bootstrap";

export const PipelineModule: Module = {
  id: "Pipeline.Module",
  components: [PIPELINE_COMPONENT],
};
