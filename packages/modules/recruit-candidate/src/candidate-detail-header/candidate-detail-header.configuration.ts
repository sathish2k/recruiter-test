import type { ActionItem } from "@recruit/shared";

export interface CandidateDetailHeaderConfiguration {
  editRouteId: string;
  menuActions: ActionItem[];
}

/** The hero's actions. Editing is the filled button; everything else lives in
 * the overflow menu, as the design draws it. */
export const CandidateDetailHeaderConfiguration: CandidateDetailHeaderConfiguration = {
  editRouteId: "Recruit.CandidateEdit.Route",
  menuActions: [
    {
      type: "viewRequirement",
      icon: "work",
      label: { name: "actions.viewRequirement" },
      routeId: "Recruit.JobDetail.Route",
      params: { id: { type: "dynamic", path: "jobId" } },
    },
    {
      type: "scheduleInterview",
      icon: "event",
      label: { name: "actions.scheduleInterview" },
      routeId: "Recruit.Interviews.Route",
    },
    {
      type: "backToList",
      icon: "group",
      label: { name: "actions.backToList" },
      routeId: "Recruit.Candidates.Route",
    },
  ],
};
