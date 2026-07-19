import type { Module } from "@recruit/sdk";
import { ADD_CANDIDATE_COMPONENT } from "./add-candidate/bootstrap";
import { CANDIDATE_DETAIL_COMPONENT } from "./candidate-detail/bootstrap";
import { CANDIDATES_COMPONENT } from "./candidates/bootstrap";
import { CV_REVIEW_COMPONENT } from "./cv-review/bootstrap";
import { EDIT_CANDIDATE_COMPONENT } from "./edit-candidate/bootstrap";

export const CandidateModule: Module = {
  id: "Candidate.Module",
  components: [
    CANDIDATES_COMPONENT,
    ADD_CANDIDATE_COMPONENT,
    CANDIDATE_DETAIL_COMPONENT,
    EDIT_CANDIDATE_COMPONENT,
    CV_REVIEW_COMPONENT,
  ],
};
