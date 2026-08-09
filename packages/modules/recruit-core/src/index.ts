import type { Module } from "@recruit/sdk";
import { PLACEHOLDER_COMPONENT } from "./placeholder/bootstrap";

export const CoreModule: Module = {
  id: "Core.Module",
  components: [PLACEHOLDER_COMPONENT],
};
