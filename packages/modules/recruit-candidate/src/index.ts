import type { Module } from "@recruit/sdk";
import { CANDIDATES_COMPONENT } from "./candidates/bootstrap";

export const CandidateModule: Module = {
  id: "Candidate.Module",
  components: [CANDIDATES_COMPONENT],
};
