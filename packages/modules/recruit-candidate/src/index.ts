import type { Module } from "@recruit/sdk";
import { CANDIDATE_DETAIL_ACTIONS_COMPONENT } from "./candidate-detail-actions/bootstrap";
import { CANDIDATE_DETAIL_ASSESSMENT_COMPONENT } from "./candidate-detail-assessment/bootstrap";
import { CANDIDATE_DETAIL_ASSIGNMENT_COMPONENT } from "./candidate-detail-assignment/bootstrap";
import { CANDIDATE_DETAIL_EXPERIENCE_COMPONENT } from "./candidate-detail-experience/bootstrap";
import { CANDIDATE_DETAIL_HEADER_COMPONENT } from "./candidate-detail-header/bootstrap";
import { CANDIDATE_DETAIL_INFO_COMPONENT } from "./candidate-detail-info/bootstrap";
import { CANDIDATE_DETAIL_WORKSPACE_COMPONENT } from "./candidate-detail-workspace/bootstrap";
import { CANDIDATE_FORM_COMPONENT } from "./candidate-form/bootstrap";
import { CANDIDATE_IMPORT_COMPONENT } from "./candidate-import/bootstrap";
import { CANDIDATE_STATS_COMPONENT } from "./candidate-stats/bootstrap";
import { CANDIDATES_COMPONENT } from "./candidates/bootstrap";

export const CandidateModule: Module = {
  id: "Candidate.Module",
  components: [
    CANDIDATE_STATS_COMPONENT,
    CANDIDATES_COMPONENT,
    CANDIDATE_FORM_COMPONENT,
    CANDIDATE_IMPORT_COMPONENT,
    CANDIDATE_DETAIL_HEADER_COMPONENT,
    CANDIDATE_DETAIL_ASSESSMENT_COMPONENT,
    CANDIDATE_DETAIL_EXPERIENCE_COMPONENT,
    CANDIDATE_DETAIL_WORKSPACE_COMPONENT,
    CANDIDATE_DETAIL_INFO_COMPONENT,
    CANDIDATE_DETAIL_ASSIGNMENT_COMPONENT,
    CANDIDATE_DETAIL_ACTIONS_COMPONENT,
  ],
};
