import type { Module } from "@recruit/sdk";
import { JOB_FORM_COMPONENT } from "./job-form/bootstrap";
import { JOBS_COMPONENT } from "./jobs/bootstrap";

export const JobModule: Module = {
  id: "Job.Module",
  components: [JOBS_COMPONENT, JOB_FORM_COMPONENT],
};
