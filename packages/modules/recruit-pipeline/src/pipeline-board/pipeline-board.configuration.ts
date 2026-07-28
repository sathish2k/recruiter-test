/** A column limit is advisory (D4): over it the header is flagged, never
 * blocked. Zero turns the flag off. */
export interface PipelineBoardConfiguration {
  wipLimit: number;
  /** Where the Table view of the same records lives. */
  tableRouteId: string;
  boardRouteId: string;
  candidateRouteId: string;
  requirementRouteId: string;
  addRouteId: string;
  /** Filters offered in the toolbar, each reading its options from the API. */
  filters: {
    key: string;
    label: string;
    url: string;
    path: string;
    valueKey: string;
    labelKey: string;
  }[];
}

export const PipelineBoardConfiguration: PipelineBoardConfiguration = {
  wipLimit: 12,
  tableRouteId: "Recruit.Candidates.Route",
  boardRouteId: "Recruit.CandidateBoard.Route",
  candidateRouteId: "Recruit.CandidateDetail.Route",
  requirementRouteId: "Recruit.JobDetail.Route",
  addRouteId: "Recruit.CandidateNew.Route",
  filters: [
    {
      key: "clientId",
      label: "filters.client",
      url: "/clients",
      path: "data",
      valueKey: "id",
      labelKey: "name",
    },
    {
      key: "jobId",
      label: "filters.requirement",
      url: "/jobs",
      path: "data",
      valueKey: "id",
      labelKey: "title",
    },
  ],
};
