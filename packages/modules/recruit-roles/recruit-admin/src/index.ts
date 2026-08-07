import type { Module } from "@recruit/sdk";
import { ADMIN_ACTIVITY_COMPONENT } from "./admin-activity/bootstrap";
import { ADMIN_AI_COMPONENT } from "./admin-ai/bootstrap";
import { ADMIN_CHART_COMPONENT } from "./admin-chart/bootstrap";
import { ADMIN_KPIS_COMPONENT } from "./admin-kpis/bootstrap";
import { ADMIN_QUEUE_COMPONENT } from "./admin-queue/bootstrap";
import { ADMIN_QUICK_ACTIONS_COMPONENT } from "./admin-quick-actions/bootstrap";
import { ADMIN_RECENTS_COMPONENT } from "./admin-recents/bootstrap";
import { ADMIN_SIDE_COMPONENT } from "./admin-side/bootstrap";
import { ADMIN_STATUS_COMPONENT } from "./admin-status/bootstrap";
import { ADMIN_SYSTEM_COMPONENT } from "./admin-system/bootstrap";
import { ADMIN_TODAY_WORK_COMPONENT } from "./admin-today-work/bootstrap";

/**
 * The Admin dashboard, in the design's card order. Every widget is a shared
 * renderer bound to this role's own configuration, translation and datasource.
 */
export const AdminDashboardModule: Module = {
  id: "Dashboard.Admin.Module",
  components: [
    ADMIN_KPIS_COMPONENT,
    ADMIN_STATUS_COMPONENT,
    ADMIN_SYSTEM_COMPONENT,
    ADMIN_TODAY_WORK_COMPONENT,
    ADMIN_QUEUE_COMPONENT,
    ADMIN_SIDE_COMPONENT,
    ADMIN_CHART_COMPONENT,
    ADMIN_QUICK_ACTIONS_COMPONENT,
    ADMIN_AI_COMPONENT,
    ADMIN_ACTIVITY_COMPONENT,
    ADMIN_RECENTS_COMPONENT,
  ],
};
