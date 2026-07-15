import type { Module } from "@recruit/sdk";
import { AI_SCREENING_COMPONENT } from "./ai-screening/bootstrap";
import { AUTOMATION_COMPONENT } from "./automation/bootstrap";

export const AiModule: Module = {
  id: "Ai.Module",
  components: [AI_SCREENING_COMPONENT, AUTOMATION_COMPONENT],
};
