import type { Module } from "@recruit/sdk";
import { OWNER_ACTIVITY_COMPONENT } from "./owner-activity/bootstrap";
import { OWNER_AI_COMPONENT } from "./owner-ai/bootstrap";
import { OWNER_CHART_COMPONENT } from "./owner-chart/bootstrap";
import { OWNER_CLIENT_HEALTH_COMPONENT } from "./owner-client-health/bootstrap";
import { OWNER_KPIS_COMPONENT } from "./owner-kpis/bootstrap";
import { OWNER_QUEUE_COMPONENT } from "./owner-queue/bootstrap";
import { OWNER_QUICK_ACTIONS_COMPONENT } from "./owner-quick-actions/bootstrap";
import { OWNER_RECENTS_COMPONENT } from "./owner-recents/bootstrap";
import { OWNER_SIDE_COMPONENT } from "./owner-side/bootstrap";
import { OWNER_STATUS_COMPONENT } from "./owner-status/bootstrap";
import { OWNER_TEAM_COMPONENT } from "./owner-team/bootstrap";
import { OWNER_TODAY_WORK_COMPONENT } from "./owner-today-work/bootstrap";

/**
 * The Owner dashboard, in the design's card order. Every widget is a shared
 * renderer bound to this role's own configuration, translation and datasource.
 */
export const OwnerDashboardModule: Module = {
  id: "Dashboard.Owner.Module",
  components: [
    OWNER_KPIS_COMPONENT,
    OWNER_STATUS_COMPONENT,
    OWNER_TODAY_WORK_COMPONENT,
    OWNER_TEAM_COMPONENT,
    OWNER_CLIENT_HEALTH_COMPONENT,
    OWNER_QUEUE_COMPONENT,
    OWNER_SIDE_COMPONENT,
    OWNER_CHART_COMPONENT,
    OWNER_QUICK_ACTIONS_COMPONENT,
    OWNER_AI_COMPONENT,
    OWNER_ACTIVITY_COMPONENT,
    OWNER_RECENTS_COMPONENT,
  ],
};
