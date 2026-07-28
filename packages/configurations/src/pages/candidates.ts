import type { Configuration } from "@recruit/sdk";

export const CandidatePages: Record<string, Configuration> = {
  "Recruit.Candidates.Page": {
    id: "Recruit.Candidates.Page",
    elements: [
      { id: "candidates", type: "component", componentType: "Recruit.Candidates.Component" },
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
};
