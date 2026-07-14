import type { Module } from "@recruit/sdk";
import { ADD_CANDIDATE_COMPONENT } from "./add-candidate/bootstrap";
import { CANDIDATE_DETAIL_COMPONENT } from "./candidate-detail/bootstrap";
import { CANDIDATES_COMPONENT } from "./candidates/bootstrap";

export const CandidateModule: Module = {
  id: "Candidate.Module",
  components: [
    CANDIDATES_COMPONENT,
    ADD_CANDIDATE_COMPONENT,
    CANDIDATE_DETAIL_COMPONENT,
  ],
};
