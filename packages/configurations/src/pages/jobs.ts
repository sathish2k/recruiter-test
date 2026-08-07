import type { Configuration } from "@recruit/sdk";

export const JobPages: Record<string, Configuration> = {
  "Recruit.Jobs.Page": {
    id: "Recruit.Jobs.Page",
    stackContainer: { spacing: 2.5 },
    elements: [
      { id: "job-stats", type: "component", componentType: "Recruit.JobStats.Component" },
      { id: "jobs", type: "component", componentType: "Recruit.Jobs.Component" },
    ],
  },
  "Recruit.JobForm.Page": {
    id: "Recruit.JobForm.Page",
    elements: [{ id: "job-form", type: "component", componentType: "Recruit.JobForm.Component" }],
  },

  /**
   * Main column + rail, the same 8/4 split the client and contact screens use:
   * the layout pads the content region, so the columns cancel that on their
   * shared edge and re-apply the design's gutters around the hairline.
   */
  "Recruit.JobDetail.Page": {
    id: "Recruit.JobDetail.Page",
    gridContainer: { spacing: 0 },
    elements: [
      {
        id: "job-detail-main",
        type: "configuration",
        configurationId: "Recruit.JobDetailMain.Configuration",
        gridItem: { size: { xs: 12, lg: 8 } },
        sx: {
          pr: { lg: "26px" },
          borderRight: { lg: "1px solid" },
          borderColor: { lg: "divider" },
        },
      },
      {
        id: "job-detail-rail",
        type: "configuration",
        configurationId: "Recruit.JobDetailRail.Configuration",
        gridItem: { size: { xs: 12, lg: 4 } },
        sx: { pl: { lg: "22px" }, pt: { xs: "20px", lg: 0 } },
      },
    ],
  },

  "Recruit.JobDetailMain.Configuration": {
    id: "Recruit.JobDetailMain.Configuration",
    stackContainer: { spacing: 2.5 },
    elements: [
      {
        id: "job-detail-header",
        type: "component",
        componentType: "Recruit.JobDetailHeader.Component",
      },
      {
        id: "job-detail-stats",
        type: "component",
        componentType: "Recruit.JobDetailStats.Component",
      },
      {
        id: "job-detail-pipeline",
        type: "component",
        componentType: "Recruit.JobDetailPipeline.Component",
      },
      {
        id: "job-detail-content",
        type: "component",
        componentType: "Recruit.JobDetailContent.Component",
      },
    ],
  },

  "Recruit.JobDetailRail.Configuration": {
    id: "Recruit.JobDetailRail.Configuration",
    stackContainer: { spacing: 2 },
    elements: [
      {
        id: "job-detail-team",
        type: "component",
        componentType: "Recruit.JobDetailTeam.Component",
      },
      {
        id: "job-detail-timeline",
        type: "component",
        componentType: "Recruit.JobDetailTimeline.Component",
      },
      {
        id: "job-detail-info",
        type: "component",
        componentType: "Recruit.JobDetailInfo.Component",
      },
      {
        id: "job-detail-screening",
        type: "component",
        componentType: "Recruit.JobDetailScreening.Component",
      },
    ],
  },
};
