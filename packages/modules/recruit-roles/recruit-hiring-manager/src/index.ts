import type { Module } from "@recruit/sdk";
import { HIRING_MANAGER_ACTIVITY_COMPONENT } from "./hiring-manager-activity/bootstrap";
import { HIRING_MANAGER_AI_COMPONENT } from "./hiring-manager-ai/bootstrap";
import { HIRING_MANAGER_CHART_COMPONENT } from "./hiring-manager-chart/bootstrap";
import { HIRING_MANAGER_KPIS_COMPONENT } from "./hiring-manager-kpis/bootstrap";
import { HIRING_MANAGER_MY_PIPELINE_COMPONENT } from "./hiring-manager-my-pipeline/bootstrap";
import { HIRING_MANAGER_QUEUE_COMPONENT } from "./hiring-manager-queue/bootstrap";
import { HIRING_MANAGER_QUICK_ACTIONS_COMPONENT } from "./hiring-manager-quick-actions/bootstrap";
import { HIRING_MANAGER_RECENTS_COMPONENT } from "./hiring-manager-recents/bootstrap";
import { HIRING_MANAGER_SIDE_COMPONENT } from "./hiring-manager-side/bootstrap";
import { HIRING_MANAGER_STATUS_COMPONENT } from "./hiring-manager-status/bootstrap";
import { HIRING_MANAGER_TODAY_WORK_COMPONENT } from "./hiring-manager-today-work/bootstrap";
import { HIRING_MANAGER_WEEK_GOALS_COMPONENT } from "./hiring-manager-week-goals/bootstrap";

/**
 * The HiringManager dashboard, in the design's card order. Every widget is a shared
 * renderer bound to this role's own configuration, translation and datasource.
 */
export const HiringManagerDashboardModule: Module = {
  id: "Dashboard.HiringManager.Module",
  components: [
    HIRING_MANAGER_KPIS_COMPONENT,
    HIRING_MANAGER_STATUS_COMPONENT,
    HIRING_MANAGER_TODAY_WORK_COMPONENT,
    HIRING_MANAGER_MY_PIPELINE_COMPONENT,
    HIRING_MANAGER_WEEK_GOALS_COMPONENT,
    HIRING_MANAGER_QUEUE_COMPONENT,
    HIRING_MANAGER_SIDE_COMPONENT,
    HIRING_MANAGER_CHART_COMPONENT,
    HIRING_MANAGER_QUICK_ACTIONS_COMPONENT,
    HIRING_MANAGER_AI_COMPONENT,
    HIRING_MANAGER_ACTIVITY_COMPONENT,
    HIRING_MANAGER_RECENTS_COMPONENT,
  ],
};
