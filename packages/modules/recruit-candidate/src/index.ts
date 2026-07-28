import type { Module } from "@recruit/sdk";
import { CANDIDATE_FORM_COMPONENT } from "./candidate-form/bootstrap";
import { CANDIDATE_IMPORT_COMPONENT } from "./candidate-import/bootstrap";
import { CANDIDATES_COMPONENT } from "./candidates/bootstrap";

export const CandidateModule: Module = {
  id: "Candidate.Module",
  components: [CANDIDATES_COMPONENT, CANDIDATE_FORM_COMPONENT, CANDIDATE_IMPORT_COMPONENT],
};
