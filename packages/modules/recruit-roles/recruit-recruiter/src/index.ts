import type { Module } from "@recruit/sdk";
import { RECRUITER_ACTIVITY_COMPONENT } from "./recruiter-activity/bootstrap";
import { RECRUITER_AI_COMPONENT } from "./recruiter-ai/bootstrap";
import { RECRUITER_CHART_COMPONENT } from "./recruiter-chart/bootstrap";
import { RECRUITER_KPIS_COMPONENT } from "./recruiter-kpis/bootstrap";
import { RECRUITER_MY_PIPELINE_COMPONENT } from "./recruiter-my-pipeline/bootstrap";
import { RECRUITER_QUEUE_COMPONENT } from "./recruiter-queue/bootstrap";
import { RECRUITER_QUICK_ACTIONS_COMPONENT } from "./recruiter-quick-actions/bootstrap";
import { RECRUITER_RECENTS_COMPONENT } from "./recruiter-recents/bootstrap";
import { RECRUITER_SIDE_COMPONENT } from "./recruiter-side/bootstrap";
import { RECRUITER_STATUS_COMPONENT } from "./recruiter-status/bootstrap";
import { RECRUITER_TODAY_WORK_COMPONENT } from "./recruiter-today-work/bootstrap";
import { RECRUITER_WEEK_GOALS_COMPONENT } from "./recruiter-week-goals/bootstrap";

/**
 * The Recruiter dashboard, in the design's card order. Every widget is a shared
 * renderer bound to this role's own configuration, translation and datasource.
 */
export const RecruiterDashboardModule: Module = {
  id: "Dashboard.Recruiter.Module",
  components: [
    RECRUITER_KPIS_COMPONENT,
    RECRUITER_STATUS_COMPONENT,
    RECRUITER_TODAY_WORK_COMPONENT,
    RECRUITER_MY_PIPELINE_COMPONENT,
    RECRUITER_WEEK_GOALS_COMPONENT,
    RECRUITER_QUEUE_COMPONENT,
    RECRUITER_SIDE_COMPONENT,
    RECRUITER_CHART_COMPONENT,
    RECRUITER_QUICK_ACTIONS_COMPONENT,
    RECRUITER_AI_COMPONENT,
    RECRUITER_ACTIVITY_COMPONENT,
    RECRUITER_RECENTS_COMPONENT,
  ],
};
