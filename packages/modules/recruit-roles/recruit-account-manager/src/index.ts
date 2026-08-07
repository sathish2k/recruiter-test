import type { Module } from "@recruit/sdk";
import { ACCOUNT_MANAGER_ACTIVITY_COMPONENT } from "./account-manager-activity/bootstrap";
import { ACCOUNT_MANAGER_AI_COMPONENT } from "./account-manager-ai/bootstrap";
import { ACCOUNT_MANAGER_CHART_COMPONENT } from "./account-manager-chart/bootstrap";
import { ACCOUNT_MANAGER_KPIS_COMPONENT } from "./account-manager-kpis/bootstrap";
import { ACCOUNT_MANAGER_QUEUE_COMPONENT } from "./account-manager-queue/bootstrap";
import { ACCOUNT_MANAGER_QUICK_ACTIONS_COMPONENT } from "./account-manager-quick-actions/bootstrap";
import { ACCOUNT_MANAGER_RECENTS_COMPONENT } from "./account-manager-recents/bootstrap";
import { ACCOUNT_MANAGER_SIDE_COMPONENT } from "./account-manager-side/bootstrap";
import { ACCOUNT_MANAGER_STATUS_COMPONENT } from "./account-manager-status/bootstrap";
import { ACCOUNT_MANAGER_TODAY_WORK_COMPONENT } from "./account-manager-today-work/bootstrap";

/**
 * The AccountManager dashboard, in the design's card order. Every widget is a shared
 * renderer bound to this role's own configuration, translation and datasource.
 */
export const AccountManagerDashboardModule: Module = {
  id: "Dashboard.AccountManager.Module",
  components: [
    ACCOUNT_MANAGER_KPIS_COMPONENT,
    ACCOUNT_MANAGER_STATUS_COMPONENT,
    ACCOUNT_MANAGER_TODAY_WORK_COMPONENT,
    ACCOUNT_MANAGER_QUEUE_COMPONENT,
    ACCOUNT_MANAGER_SIDE_COMPONENT,
    ACCOUNT_MANAGER_CHART_COMPONENT,
    ACCOUNT_MANAGER_QUICK_ACTIONS_COMPONENT,
    ACCOUNT_MANAGER_AI_COMPONENT,
    ACCOUNT_MANAGER_ACTIVITY_COMPONENT,
    ACCOUNT_MANAGER_RECENTS_COMPONENT,
  ],
};
