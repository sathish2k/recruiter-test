import type { Configuration } from "@recruit/sdk";

export const CandidatePages: Record<string, Configuration> = {
  "Recruit.Candidates.Page": {
    id: "Recruit.Candidates.Page",
    elements: [
      { id: "candidates", type: "component", componentType: "Recruit.Candidates.Component" },
    ],
  },
  "Recruit.CandidateForm.Page": {
    id: "Recruit.CandidateForm.Page",
    elements: [
      { id: "candidate-form", type: "component", componentType: "Recruit.CandidateForm.Component" },
    ],
  },
};
