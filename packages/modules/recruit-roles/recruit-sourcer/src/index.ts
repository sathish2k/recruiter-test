import type { Module } from "@recruit/sdk";
import { SOURCER_ACTIVITY_COMPONENT } from "./sourcer-activity/bootstrap";
import { SOURCER_AI_COMPONENT } from "./sourcer-ai/bootstrap";
import { SOURCER_CHART_COMPONENT } from "./sourcer-chart/bootstrap";
import { SOURCER_KPIS_COMPONENT } from "./sourcer-kpis/bootstrap";
import { SOURCER_MY_PIPELINE_COMPONENT } from "./sourcer-my-pipeline/bootstrap";
import { SOURCER_QUEUE_COMPONENT } from "./sourcer-queue/bootstrap";
import { SOURCER_QUICK_ACTIONS_COMPONENT } from "./sourcer-quick-actions/bootstrap";
import { SOURCER_RECENTS_COMPONENT } from "./sourcer-recents/bootstrap";
import { SOURCER_SAVED_SEARCHES_COMPONENT } from "./sourcer-saved-searches/bootstrap";
import { SOURCER_SIDE_COMPONENT } from "./sourcer-side/bootstrap";
import { SOURCER_STATUS_COMPONENT } from "./sourcer-status/bootstrap";
import { SOURCER_TODAY_WORK_COMPONENT } from "./sourcer-today-work/bootstrap";
import { SOURCER_WEEK_GOALS_COMPONENT } from "./sourcer-week-goals/bootstrap";

/**
 * The Sourcer dashboard, in the design's card order. Every widget is a shared
 * renderer bound to this role's own configuration, translation and datasource.
 */
export const SourcerDashboardModule: Module = {
  id: "Dashboard.Sourcer.Module",
  components: [
    SOURCER_KPIS_COMPONENT,
    SOURCER_STATUS_COMPONENT,
    SOURCER_TODAY_WORK_COMPONENT,
    SOURCER_MY_PIPELINE_COMPONENT,
    SOURCER_WEEK_GOALS_COMPONENT,
    SOURCER_SAVED_SEARCHES_COMPONENT,
    SOURCER_QUEUE_COMPONENT,
    SOURCER_SIDE_COMPONENT,
    SOURCER_CHART_COMPONENT,
    SOURCER_QUICK_ACTIONS_COMPONENT,
    SOURCER_AI_COMPONENT,
    SOURCER_ACTIVITY_COMPONENT,
    SOURCER_RECENTS_COMPONENT,
  ],
};
