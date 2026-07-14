import type { Configuration } from "@recruit/sdk";

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
      },
      {
        id: "dashboard-rail",
        type: "configuration",
        configurationId: "Recruit.DashboardRail.Configuration",
        gridItem: { size: "auto" },
        sx: { width: "350px", flex: "0 0 350px" },
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
};
