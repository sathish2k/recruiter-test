export interface JobDetailTeamConfiguration {
  /** Where "Change" goes — the team is edited on the requirement form. */
  editRouteId: string;
}

export const JobDetailTeamConfiguration: JobDetailTeamConfiguration = {
  editRouteId: "Recruit.JobEdit.Route",
};
