import type { Module } from "@recruit/sdk";
import { JOBS_COMPONENT } from "./jobs/bootstrap";

export const JobsModule: Module = {
  id: "Jobs.Module",
  components: [JOBS_COMPONENT],
};
