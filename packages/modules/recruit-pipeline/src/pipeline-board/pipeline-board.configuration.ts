import type { JsonSchema } from "@recruit/shared";

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
  /** The move dialog. Both option lists come from the workspace's own
   * endpoints, and the two targets are conditional on the outcome — a hidden
   * field is stripped and skipped in validation, which is what makes
   * "a rejection needs a reason" a schema rule rather than a handler. */
  moveSchema: JsonSchema;
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
  moveSchema: {
    type: "object",
    properties: {
      outcome: {
        type: "string",
        widget: "segmented",
        title: "move.outcome",
        enum: ["move", "reject"],
        enumL10n: "outcomes",
        default: "move",
        grid: { size: { xs: 12 } },
      },
      toStageId: {
        type: "string",
        widget: "select",
        title: "move.target",
        placeholder: "move.pick",
        condition: { field: "outcome", equals: "move" },
        optionSource: {
          url: "/pipeline/stages",
          path: "data",
          valueKey: "id",
          labelKey: "name",
        },
        grid: { size: { xs: 12 } },
      },
      reasonId: {
        type: "string",
        widget: "select",
        title: "move.reason",
        placeholder: "move.reasonPlaceholder",
        help: "move.reasonHelp",
        condition: { field: "outcome", equals: "reject" },
        optionSource: {
          url: "/pipeline/rejection-reasons",
          path: "data",
          valueKey: "id",
          labelKey: "label",
        },
        grid: { size: { xs: 12 } },
      },
      note: {
        type: "string",
        widget: "textarea",
        rows: 3,
        title: "move.note",
        placeholder: "move.notePlaceholder",
        help: "move.noteHelp",
        maxLength: 2000,
        grid: { size: { xs: 12 } },
      },
    },
    required: ["toStageId", "reasonId"],
    errorMessage: {
      required: {
        toStageId: "move.targetRequired",
        reasonId: "move.reasonRequired",
      },
    },
  },
};
