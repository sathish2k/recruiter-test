import type { Module } from "@recruit/sdk";
import { DASHBOARD_EMPTY_WORKSPACE_COMPONENT } from "./dashboard-empty-workspace/bootstrap";
import { DASHBOARD_QUEUE_COMPONENT } from "./dashboard-queue/bootstrap";
import { DASHBOARD_QUICK_ACTIONS_COMPONENT } from "./dashboard-quick-actions/bootstrap";
import { DASHBOARD_STATS_COMPONENT } from "./dashboard-stats/bootstrap";
import { DASHBOARD_WELCOME_COMPONENT } from "./dashboard-welcome/bootstrap";

/**
 * The dashboard shell, not a dashboard.
 *
 * Two jobs only:
 *  - the widgets every role renders regardless of who they are — the greeting,
 *    the quick actions, the rail, the pipeline and activity blocks;
 *  - the generic alert / KPI / queue trio, which is what a *custom* role an
 *    agency invents falls back to when it matches none of the built-in
 *    variants (see `dashboardVariantFor`).
 *
 * A role's own cards live in `@recruit/roles` — each role package owns its
 * configuration, translation and datasource, and shares only the renderers.
 */
export const DashboardModule: Module = {
  id: "Dashboard.Module",
  components: [
    DASHBOARD_WELCOME_COMPONENT,
    DASHBOARD_EMPTY_WORKSPACE_COMPONENT,
    DASHBOARD_STATS_COMPONENT,
    DASHBOARD_QUEUE_COMPONENT,
    DASHBOARD_QUICK_ACTIONS_COMPONENT,
  ],
};
