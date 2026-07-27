import type { Module } from "@recruit/sdk";
import { DASHBOARD_ACTIVITY_COMPONENT } from "./dashboard-activity/bootstrap";
import { DASHBOARD_ACTIVITY_FEED_COMPONENT } from "./dashboard-activity-feed/bootstrap";
import { DASHBOARD_AI_RECOMMENDATION_COMPONENT } from "./dashboard-ai-recommendation/bootstrap";
import { DASHBOARD_INSIGHT_COMPONENT } from "./dashboard-insight/bootstrap";
import { DASHBOARD_NEXT_INTERVIEW_COMPONENT } from "./dashboard-next-interview/bootstrap";
import { DASHBOARD_PIPELINE_COMPONENT } from "./dashboard-pipeline/bootstrap";
import { DASHBOARD_PRIORITIES_COMPONENT } from "./dashboard-priorities/bootstrap";
import { DASHBOARD_RAIL_FILTER_COMPONENT } from "./dashboard-rail-filter/bootstrap";
import { DASHBOARD_RECENT_CANDIDATES_COMPONENT } from "./dashboard-recent-candidates/bootstrap";
import { DASHBOARD_SLA_COMPONENT } from "./dashboard-sla/bootstrap";
import { DASHBOARD_STATS_COMPONENT } from "./dashboard-stats/bootstrap";
import { DASHBOARD_UPCOMING_COMPONENT } from "./dashboard-upcoming/bootstrap";
import { DASHBOARD_WELCOME_COMPONENT } from "./dashboard-welcome/bootstrap";

export const DashboardModule: Module = {
  id: "Dashboard.Module",
  components: [
    DASHBOARD_WELCOME_COMPONENT,
    DASHBOARD_STATS_COMPONENT,
    DASHBOARD_INSIGHT_COMPONENT,
    DASHBOARD_ACTIVITY_COMPONENT,
    DASHBOARD_PIPELINE_COMPONENT,
    DASHBOARD_AI_RECOMMENDATION_COMPONENT,
    DASHBOARD_RECENT_CANDIDATES_COMPONENT,
    DASHBOARD_RAIL_FILTER_COMPONENT,
    DASHBOARD_NEXT_INTERVIEW_COMPONENT,
    DASHBOARD_SLA_COMPONENT,
    DASHBOARD_PRIORITIES_COMPONENT,
    DASHBOARD_UPCOMING_COMPONENT,
    DASHBOARD_ACTIVITY_FEED_COMPONENT,
  ],
};
