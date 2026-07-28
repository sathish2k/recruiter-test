import type { Module } from "@recruit/sdk";
import { JOB_DETAIL_CONTENT_COMPONENT } from "./job-detail-content/bootstrap";
import { JOB_DETAIL_HEADER_COMPONENT } from "./job-detail-header/bootstrap";
import { JOB_DETAIL_INFO_COMPONENT } from "./job-detail-info/bootstrap";
import { JOB_DETAIL_SCREENING_COMPONENT } from "./job-detail-screening/bootstrap";
import { JOB_DETAIL_STATS_COMPONENT } from "./job-detail-stats/bootstrap";
import { JOB_DETAIL_TEAM_COMPONENT } from "./job-detail-team/bootstrap";
import { JOB_DETAIL_TIMELINE_COMPONENT } from "./job-detail-timeline/bootstrap";
import { JOB_FORM_COMPONENT } from "./job-form/bootstrap";
import { JOBS_COMPONENT } from "./jobs/bootstrap";

export const JobModule: Module = {
  id: "Job.Module",
  components: [
    JOBS_COMPONENT,
    JOB_FORM_COMPONENT,
    JOB_DETAIL_HEADER_COMPONENT,
    JOB_DETAIL_STATS_COMPONENT,
    JOB_DETAIL_CONTENT_COMPONENT,
    JOB_DETAIL_TEAM_COMPONENT,
    JOB_DETAIL_TIMELINE_COMPONENT,
    JOB_DETAIL_INFO_COMPONENT,
    JOB_DETAIL_SCREENING_COMPONENT,
  ],
};
