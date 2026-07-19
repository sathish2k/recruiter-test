import type { Module } from "@recruit/sdk";
import { ADD_JOB_COMPONENT } from "./add-job/bootstrap";
import { EDIT_JOB_COMPONENT } from "./edit-job/bootstrap";
import { JOB_DETAIL_COMPONENT } from "./job-detail/bootstrap";
import { JOBS_COMPONENT } from "./jobs/bootstrap";

export const JobsModule: Module = {
  id: "Jobs.Module",
  components: [
    JOBS_COMPONENT,
    ADD_JOB_COMPONENT,
    JOB_DETAIL_COMPONENT,
    EDIT_JOB_COMPONENT,
  ],
};
