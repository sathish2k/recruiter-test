import type { Module } from "@recruit/sdk";
import { EMPLOYEE_AI_ACTIVITY_COMPONENT } from "./employee-ai-activity/bootstrap";
import { EMPLOYEE_FOLLOWUPS_COMPONENT } from "./employee-followups/bootstrap";
import { EMPLOYEE_FUNNEL_COMPONENT } from "./employee-funnel/bootstrap";
import { EMPLOYEE_GREETING_COMPONENT } from "./employee-greeting/bootstrap";
import { EMPLOYEE_INVITES_CHART_COMPONENT } from "./employee-invites-chart/bootstrap";
import { EMPLOYEE_KPIS_COMPONENT } from "./employee-kpis/bootstrap";
import { EMPLOYEE_ROLES_COMPONENT } from "./employee-roles/bootstrap";
import { HIRING_COMPONENT } from "./hiring/bootstrap";
import { LEAD_CLIENT_DECISIONS_COMPONENT } from "./lead-client-decisions/bootstrap";
import { LEAD_CV_QUEUE_COMPONENT } from "./lead-cv-queue/bootstrap";
import { LEAD_FUNNEL_COMPONENT } from "./lead-funnel/bootstrap";
import { LEAD_GREETING_COMPONENT } from "./lead-greeting/bootstrap";
import { LEAD_INTERVIEWS_TODAY_COMPONENT } from "./lead-interviews-today/bootstrap";
import { LEAD_KPIS_COMPONENT } from "./lead-kpis/bootstrap";
import { LEAD_SOURCERS_COMPONENT } from "./lead-sourcers/bootstrap";
import { NEXT_INTERVIEW_COMPONENT } from "./next-interview/bootstrap";
import { QUICK_ACTIONS_COMPONENT } from "./quick-actions/bootstrap";
import { RAIL_CONTROLS_COMPONENT } from "./rail-controls/bootstrap";
import { RECENT_CANDIDATES_COMPONENT } from "./recent-candidates/bootstrap";
import { SCREENING_COMPONENT } from "./screening/bootstrap";
import { STATS_COMPONENT } from "./stats/bootstrap";
import { DASHBOARD_TOOLBAR_COMPONENT } from "./toolbar/bootstrap";
import { UPCOMING_INTERVIEWS_COMPONENT } from "./upcoming-interviews/bootstrap";

export const DashboardModule: Module = {
  id: "Dashboard.Module",
  components: [
    DASHBOARD_TOOLBAR_COMPONENT,
    STATS_COMPONENT,
    HIRING_COMPONENT,
    RECENT_CANDIDATES_COMPONENT,
    RAIL_CONTROLS_COMPONENT,
    NEXT_INTERVIEW_COMPONENT,
    QUICK_ACTIONS_COMPONENT,
    SCREENING_COMPONENT,
    UPCOMING_INTERVIEWS_COMPONENT,
    LEAD_GREETING_COMPONENT,
    LEAD_KPIS_COMPONENT,
    LEAD_CV_QUEUE_COMPONENT,
    LEAD_CLIENT_DECISIONS_COMPONENT,
    LEAD_INTERVIEWS_TODAY_COMPONENT,
    LEAD_FUNNEL_COMPONENT,
    LEAD_SOURCERS_COMPONENT,
    EMPLOYEE_GREETING_COMPONENT,
    EMPLOYEE_KPIS_COMPONENT,
    EMPLOYEE_ROLES_COMPONENT,
    EMPLOYEE_FOLLOWUPS_COMPONENT,
    EMPLOYEE_AI_ACTIVITY_COMPONENT,
    EMPLOYEE_FUNNEL_COMPONENT,
    EMPLOYEE_INVITES_CHART_COMPONENT,
  ],
};
