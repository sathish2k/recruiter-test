import type { Module } from "@recruit/sdk";
import { CLIENT_ACTIVITY_COMPONENT } from "./client-activity/bootstrap";
import { CLIENT_CHART_COMPONENT } from "./client-chart/bootstrap";
import { CLIENT_KPIS_COMPONENT } from "./client-kpis/bootstrap";
import { CLIENT_QUEUE_COMPONENT } from "./client-queue/bootstrap";
import { CLIENT_QUICK_ACTIONS_COMPONENT } from "./client-quick-actions/bootstrap";
import { CLIENT_SIDE_COMPONENT } from "./client-side/bootstrap";
import { CLIENT_STATUS_COMPONENT } from "./client-status/bootstrap";
import { CLIENT_TODAY_WORK_COMPONENT } from "./client-today-work/bootstrap";

/**
 * The Client dashboard, in the design's card order. Every widget is a shared
 * renderer bound to this role's own configuration, translation and datasource.
 */
export const ClientDashboardModule: Module = {
  id: "Dashboard.Client.Module",
  components: [
    CLIENT_KPIS_COMPONENT,
    CLIENT_STATUS_COMPONENT,
    CLIENT_TODAY_WORK_COMPONENT,
    CLIENT_QUEUE_COMPONENT,
    CLIENT_SIDE_COMPONENT,
    CLIENT_CHART_COMPONENT,
    CLIENT_QUICK_ACTIONS_COMPONENT,
    CLIENT_ACTIVITY_COMPONENT,
  ],
};
