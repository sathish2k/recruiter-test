import type { Module } from "@recruit/sdk";
import { HIRING_COMPONENT } from "./hiring/bootstrap";
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
  ],
};
