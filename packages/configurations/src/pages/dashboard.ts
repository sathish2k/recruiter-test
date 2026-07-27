import type { Configuration } from "@recruit/sdk";

/**
 * The design's three-column shell is sidenav + main + a 372px right rail. The
 * sidenav is the layout's job, so the page is the remaining two.
 *
 * The layout already pads the content region 22/26, so the columns cancel that
 * on their shared edge and re-apply the design's own gutters around the
 * dividing hairline: main pads 26px right, the rail 22px left.
 */
export const DashboardPages: Record<string, Configuration> = {
  "Recruit.Dashboard.Page": {
    id: "Recruit.Dashboard.Page",
    gridContainer: { spacing: 0 },
    elements: [
      {
        id: "dashboard-main",
        type: "configuration",
        configurationId: "Recruit.DashboardMain.Configuration",
        gridItem: { size: { xs: 12, lg: 8 } },
        sx: {
          pr: { lg: "26px" },
          borderRight: { lg: "1px solid" },
          borderColor: { lg: "divider" },
        },
      },
      {
        id: "dashboard-rail",
        type: "configuration",
        configurationId: "Recruit.DashboardRail.Configuration",
        gridItem: { size: { xs: 12, lg: 4 } },
        sx: { pl: { lg: "22px" }, pt: { xs: "20px", lg: 0 } },
      },
    ],
  },

  "Recruit.DashboardMain.Configuration": {
    id: "Recruit.DashboardMain.Configuration",
    stackContainer: { spacing: 2.5 },
    elements: [
      {
        id: "dashboard-welcome",
        type: "component",
        componentType: "Recruit.DashboardWelcome.Component",
      },
      {
        id: "dashboard-stats",
        type: "component",
        componentType: "Recruit.DashboardStats.Component",
      },
      {
        id: "dashboard-insight",
        type: "component",
        componentType: "Recruit.DashboardInsight.Component",
        access: { resource: "candidates" },
      },
      {
        id: "dashboard-activity",
        type: "component",
        componentType: "Recruit.DashboardActivity.Component",
        access: { resource: "candidates" },
      },
      {
        id: "dashboard-pipeline",
        type: "component",
        componentType: "Recruit.DashboardPipeline.Component",
        access: { resource: "candidates" },
      },
      {
        id: "dashboard-outcomes",
        type: "configuration",
        configurationId: "Recruit.DashboardOutcomes.Configuration",
      },
      {
        id: "dashboard-recent-candidates",
        type: "component",
        componentType: "Recruit.DashboardRecentCandidates.Component",
        access: { resource: "candidates" },
      },
    ],
  },

  // The design pairs SLA status with the AI recommendation card in one row.
  "Recruit.DashboardOutcomes.Configuration": {
    id: "Recruit.DashboardOutcomes.Configuration",
    gridContainer: { spacing: 1.75 },
    elements: [
      {
        id: "dashboard-sla",
        type: "component",
        componentType: "Recruit.DashboardSla.Component",
        gridItem: { size: { xs: 12, sm: 6 } },
        access: { resource: "jobs" },
      },
      {
        id: "dashboard-ai-recommendation",
        type: "component",
        componentType: "Recruit.DashboardAiRecommendation.Component",
        gridItem: { size: { xs: 12, sm: 6 } },
        access: { resource: "candidates" },
      },
    ],
  },

  "Recruit.DashboardRail.Configuration": {
    id: "Recruit.DashboardRail.Configuration",
    stackContainer: { spacing: 1.5 },
    elements: [
      {
        id: "dashboard-rail-filter",
        type: "component",
        componentType: "Recruit.DashboardRailFilter.Component",
      },
      {
        id: "dashboard-next-interview",
        type: "component",
        componentType: "Recruit.DashboardNextInterview.Component",
        access: { resource: "interviews" },
      },
      {
        id: "dashboard-priorities",
        type: "component",
        componentType: "Recruit.DashboardPriorities.Component",
      },
      {
        id: "dashboard-upcoming",
        type: "component",
        componentType: "Recruit.DashboardUpcoming.Component",
        access: { resource: "interviews" },
      },
      {
        id: "dashboard-activity-feed",
        type: "component",
        componentType: "Recruit.DashboardActivityFeed.Component",
      },
    ],
  },
};
