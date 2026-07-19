import type { Configuration } from "@recruit/sdk";

export const CandidatePages: Record<string, Configuration> = {
  "Recruit.Candidates.Page": {
    id: "Recruit.Candidates.Page",
    elements: [
      {
        id: "candidates",
        type: "component",
        componentType: "Recruit.Candidates.Component",
      },
    ],
  },
  "Recruit.AddCandidate.Page": {
    id: "Recruit.AddCandidate.Page",
    elements: [
      {
        id: "add-candidate",
        type: "component",
        componentType: "Recruit.AddCandidate.Component",
      },
    ],
  },
  "Recruit.CandidateDetail.Page": {
    id: "Recruit.CandidateDetail.Page",
    elements: [
      {
        id: "candidate-detail",
        type: "component",
        componentType: "Recruit.CandidateDetail.Component",
      },
    ],
  },
  "Recruit.EditCandidate.Page": {
    id: "Recruit.EditCandidate.Page",
    elements: [
      {
        id: "edit-candidate",
        type: "component",
        componentType: "Recruit.EditCandidate.Component",
      },
    ],
  },
  "Recruit.CvReview.Page": {
    id: "Recruit.CvReview.Page",
    elements: [
      {
        id: "cv-review",
        type: "component",
        componentType: "Recruit.CvReview.Component",
      },
    ],
  },
};
