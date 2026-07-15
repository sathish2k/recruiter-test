import type { AccessRule, Configuration } from "@recruit/sdk";

const NON_LEAD_ACCESS: AccessRule = {
  resource: "dashboard",
  attributes: { role: ["admin", "employee", "client"] },
};

const LEAD_ACCESS: AccessRule = {
  resource: "dashboard",
  attributes: { role: ["lead"] },
};

export const DashboardPages: Record<string, Configuration> = {
  "Recruit.Home.Page": {
    id: "Recruit.Home.Page",
    gridContainer: { spacing: 3 },
    elements: [
      {
        id: "dashboard-main",
        type: "configuration",
        configurationId: "Recruit.DashboardMain.Configuration",
        gridItem: { size: "grow" },
        sx: { minWidth: 0 },
        access: NON_LEAD_ACCESS,
      },
      {
        id: "dashboard-rail",
        type: "configuration",
        configurationId: "Recruit.DashboardRail.Configuration",
        gridItem: { size: "auto" },
        sx: { width: "350px", flex: "0 0 350px" },
        access: NON_LEAD_ACCESS,
      },
      {
        id: "lead-dashboard",
        type: "configuration",
        configurationId: "Recruit.LeadDashboard.Configuration",
        gridItem: { size: 12 },
        access: LEAD_ACCESS,
      },
    ],
  },
  "Recruit.DashboardMain.Configuration": {
    id: "Recruit.DashboardMain.Configuration",
    gridContainer: { spacing: 2.5 },
    elements: [
      {
        id: "home-toolbar",
        type: "component",
        componentType: "Recruit.DashboardToolbar.Component",
        gridItem: { size: 12 },
      },
      {
        id: "home-stats",
        type: "component",
        componentType: "Recruit.Stats.Component",
        gridItem: { size: 12 },
      },
      {
        id: "home-hiring",
        type: "component",
        componentType: "Recruit.Hiring.Component",
        gridItem: { size: 12 },
      },
      {
        id: "home-recent",
        type: "component",
        componentType: "Recruit.RecentCandidates.Component",
        gridItem: { size: 12 },
      },
    ],
  },
  "Recruit.DashboardRail.Configuration": {
    id: "Recruit.DashboardRail.Configuration",
    gridContainer: { spacing: 2.25 },
    elements: [
      {
        id: "rail-controls",
        type: "component",
        componentType: "Recruit.RailControls.Component",
        gridItem: { size: 12 },
      },
      {
        id: "rail-next",
        type: "component",
        componentType: "Recruit.NextInterview.Component",
        gridItem: { size: 12 },
      },
      {
        id: "rail-quick",
        type: "component",
        componentType: "Recruit.QuickActions.Component",
        gridItem: { size: 12 },
      },
      {
        id: "rail-screening",
        type: "component",
        componentType: "Recruit.Screening.Component",
        gridItem: { size: 12 },
      },
      {
        id: "rail-upcoming",
        type: "component",
        componentType: "Recruit.UpcomingInterviews.Component",
        gridItem: { size: 12 },
      },
    ],
  },
  "Recruit.LeadDashboard.Configuration": {
    id: "Recruit.LeadDashboard.Configuration",
    gridContainer: { spacing: 2.5 },
    elements: [
      {
        id: "lead-greeting",
        type: "component",
        componentType: "Recruit.LeadGreeting.Component",
        gridItem: { size: 12 },
      },
      {
        id: "lead-kpis",
        type: "component",
        componentType: "Recruit.LeadKpis.Component",
        gridItem: { size: 12 },
      },
      {
        id: "lead-queue-row",
        type: "configuration",
        configurationId: "Recruit.LeadQueueRow.Configuration",
        gridItem: { size: 12 },
      },
      {
        id: "lead-analytics-row",
        type: "configuration",
        configurationId: "Recruit.LeadAnalyticsRow.Configuration",
        gridItem: { size: 12 },
      },
    ],
  },
  "Recruit.LeadQueueRow.Configuration": {
    id: "Recruit.LeadQueueRow.Configuration",
    gridContainer: { spacing: 2.5 },
    elements: [
      {
        id: "lead-cv-queue",
        type: "component",
        componentType: "Recruit.LeadCvQueue.Component",
        gridItem: { size: "grow" },
        sx: { minWidth: 0 },
      },
      {
        id: "lead-right-column",
        type: "configuration",
        configurationId: "Recruit.LeadRightColumn.Configuration",
        gridItem: { size: "auto" },
        sx: { width: "380px", flex: "0 0 380px" },
      },
    ],
  },
  "Recruit.LeadRightColumn.Configuration": {
    id: "Recruit.LeadRightColumn.Configuration",
    gridContainer: { spacing: 2.5 },
    elements: [
      {
        id: "lead-client-decisions",
        type: "component",
        componentType: "Recruit.LeadClientDecisions.Component",
        gridItem: { size: 12 },
      },
      {
        id: "lead-interviews-today",
        type: "component",
        componentType: "Recruit.LeadInterviewsToday.Component",
        gridItem: { size: 12 },
      },
    ],
  },
  "Recruit.LeadAnalyticsRow.Configuration": {
    id: "Recruit.LeadAnalyticsRow.Configuration",
    gridContainer: { spacing: 2.5 },
    elements: [
      {
        id: "lead-funnel",
        type: "component",
        componentType: "Recruit.LeadFunnel.Component",
        gridItem: { size: "grow" },
        sx: { minWidth: 0 },
      },
      {
        id: "lead-sourcers",
        type: "component",
        componentType: "Recruit.LeadSourcers.Component",
        gridItem: { size: "auto" },
        sx: { width: "420px", flex: "0 0 420px" },
      },
    ],
  },
};
