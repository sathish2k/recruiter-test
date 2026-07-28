import type { Configuration } from "@recruit/sdk";

export const CandidatePages: Record<string, Configuration> = {
  "Recruit.Candidates.Page": {
    id: "Recruit.Candidates.Page",
    elements: [
      { id: "candidates", type: "component", componentType: "Recruit.Candidates.Component" },
    ],
  },
  "Recruit.CandidateBoard.Page": {
    id: "Recruit.CandidateBoard.Page",
    elements: [
      { id: "pipeline-board", type: "component", componentType: "Recruit.PipelineBoard.Component" },
    ],
  },
  "Recruit.CandidateImport.Page": {
    id: "Recruit.CandidateImport.Page",
    elements: [
      {
        id: "candidate-import",
        type: "component",
        componentType: "Recruit.CandidateImport.Component",
      },
    ],
  },
  "Recruit.CandidateForm.Page": {
    id: "Recruit.CandidateForm.Page",
    elements: [
      { id: "candidate-form", type: "component", componentType: "Recruit.CandidateForm.Component" },
    ],
  },

  /** The same 8/4 split as the client and contact detail screens. */
  "Recruit.CandidateDetail.Page": {
    id: "Recruit.CandidateDetail.Page",
    gridContainer: { spacing: 0 },
    elements: [
      {
        id: "candidate-detail-main",
        type: "configuration",
        configurationId: "Recruit.CandidateDetailMain.Configuration",
        gridItem: { size: { xs: 12, lg: 8 } },
        sx: {
          pr: { lg: "26px" },
          borderRight: { lg: "1px solid" },
          borderColor: { lg: "divider" },
        },
      },
      {
        id: "candidate-detail-rail",
        type: "configuration",
        configurationId: "Recruit.CandidateDetailRail.Configuration",
        gridItem: { size: { xs: 12, lg: 4 } },
        sx: { pl: { lg: "22px" }, pt: { xs: "20px", lg: 0 } },
      },
    ],
  },

  "Recruit.CandidateDetailMain.Configuration": {
    id: "Recruit.CandidateDetailMain.Configuration",
    stackContainer: { spacing: 2.5 },
    elements: [
      {
        id: "candidate-detail-header",
        type: "component",
        componentType: "Recruit.CandidateDetailHeader.Component",
      },
      {
        id: "candidate-detail-assessment",
        type: "component",
        componentType: "Recruit.CandidateDetailAssessment.Component",
      },
      {
        id: "candidate-detail-experience",
        type: "component",
        componentType: "Recruit.CandidateDetailExperience.Component",
      },
      {
        id: "candidate-detail-workspace",
        type: "component",
        componentType: "Recruit.CandidateDetailWorkspace.Component",
      },
    ],
  },

  "Recruit.CandidateDetailRail.Configuration": {
    id: "Recruit.CandidateDetailRail.Configuration",
    stackContainer: { spacing: 2 },
    elements: [
      {
        id: "candidate-detail-info",
        type: "component",
        componentType: "Recruit.CandidateDetailInfo.Component",
      },
      {
        id: "candidate-detail-assignment",
        type: "component",
        componentType: "Recruit.CandidateDetailAssignment.Component",
      },
      {
        id: "candidate-detail-actions",
        type: "component",
        componentType: "Recruit.CandidateDetailActions.Component",
      },
    ],
  },
};
