import type { Module } from "@recruit/sdk";
import { TEAM_LEAD_ACTIVITY_COMPONENT } from "./team-lead-activity/bootstrap";
import { TEAM_LEAD_AI_COMPONENT } from "./team-lead-ai/bootstrap";
import { TEAM_LEAD_CHART_COMPONENT } from "./team-lead-chart/bootstrap";
import { TEAM_LEAD_COACHING_COMPONENT } from "./team-lead-coaching/bootstrap";
import { TEAM_LEAD_KPIS_COMPONENT } from "./team-lead-kpis/bootstrap";
import { TEAM_LEAD_QUEUE_COMPONENT } from "./team-lead-queue/bootstrap";
import { TEAM_LEAD_QUICK_ACTIONS_COMPONENT } from "./team-lead-quick-actions/bootstrap";
import { TEAM_LEAD_RECENTS_COMPONENT } from "./team-lead-recents/bootstrap";
import { TEAM_LEAD_SIDE_COMPONENT } from "./team-lead-side/bootstrap";
import { TEAM_LEAD_STATUS_COMPONENT } from "./team-lead-status/bootstrap";
import { TEAM_LEAD_TEAM_HEALTH_COMPONENT } from "./team-lead-team-health/bootstrap";
import { TEAM_LEAD_TODAY_WORK_COMPONENT } from "./team-lead-today-work/bootstrap";

/**
 * The TeamLead dashboard, in the design's card order. Every widget is a shared
 * renderer bound to this role's own configuration, translation and datasource.
 */
export const TeamLeadDashboardModule: Module = {
  id: "Dashboard.TeamLead.Module",
  components: [
    TEAM_LEAD_KPIS_COMPONENT,
    TEAM_LEAD_STATUS_COMPONENT,
    TEAM_LEAD_TODAY_WORK_COMPONENT,
    TEAM_LEAD_TEAM_HEALTH_COMPONENT,
    TEAM_LEAD_COACHING_COMPONENT,
    TEAM_LEAD_QUEUE_COMPONENT,
    TEAM_LEAD_SIDE_COMPONENT,
    TEAM_LEAD_CHART_COMPONENT,
    TEAM_LEAD_QUICK_ACTIONS_COMPONENT,
    TEAM_LEAD_AI_COMPONENT,
    TEAM_LEAD_ACTIVITY_COMPONENT,
    TEAM_LEAD_RECENTS_COMPONENT,
  ],
};
