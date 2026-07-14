import type { LinkRendererConfig } from "@recruit/shared";

export interface CandidateDetailConfig {
  backLink: LinkRendererConfig;
  appliedJobLink: LinkRendererConfig;
}

// ponytail: appliedJobLink points at the Jobs list until a Job Detail route
// (and a job id on the candidate) exists.
export const CandidateDetailConfiguration: CandidateDetailConfig = {
  backLink: { routeId: "Recruit.Candidates.Route" },
  appliedJobLink: { routeId: "Recruit.Jobs.Route" },
};
