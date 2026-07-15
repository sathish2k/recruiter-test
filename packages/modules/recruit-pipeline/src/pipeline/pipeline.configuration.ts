export type BadgeColor =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "default";

export interface PipelineColumnConfig {
  /** The real CandidateModel `stage` value — the source of truth a drag writes. */
  stage: string;
  /** Translation key for the column heading. */
  label: string;
  /** Translation key for the column hint / empty-state guidance. */
  hint: string;
  /** Decorative status dot color (hex, matching the design accents). */
  dot: string;
  slaDays: number;
  /** IconRenderer name shown in the empty state. */
  emptyIcon: string;
}

export interface PipelineConfig {
  addRouteId: string;
  cardRouteId: string;
  clients: string[];
  columns: PipelineColumnConfig[];
  badgeKinds: Record<string, BadgeColor>;
}

// ponytail: `label` values approximate the design wording (Sourcing / CV
// Received / Lead Review / Submitted / Interview) but `stage` holds the stored
// CandidateModel value — columns are config, not hardcoded, and a drop persists
// the target column's `stage` onto the candidate.
export const PipelineConfiguration: PipelineConfig = {
  addRouteId: "Recruit.AddCandidate.Route",
  cardRouteId: "Recruit.CandidateDetail.Route",
  clients: ["Nortech", "Fablio", "Vantor", "Corely"],
  columns: [
    {
      stage: "Sourced",
      label: "columns.sourcing.label",
      hint: "columns.sourcing.hint",
      dot: "#9BB8D9",
      slaDays: 5,
      emptyIcon: "person-search",
    },
    {
      stage: "Screened",
      label: "columns.cvReceived.label",
      hint: "columns.cvReceived.hint",
      dot: "#C9A6E8",
      slaDays: 4,
      emptyIcon: "description",
    },
    {
      stage: "Shortlisted",
      label: "columns.leadReview.label",
      hint: "columns.leadReview.hint",
      dot: "#F0C27C",
      slaDays: 4,
      emptyIcon: "fact_check",
    },
    {
      stage: "Interviewing",
      label: "columns.submitted.label",
      hint: "columns.submitted.hint",
      dot: "#FF9D57",
      slaDays: 7,
      emptyIcon: "send",
    },
    {
      stage: "Offer",
      label: "columns.interview.label",
      hint: "columns.interview.hint",
      dot: "#8FD6AC",
      slaDays: 6,
      emptyIcon: "event",
    },
  ],
  badgeKinds: {
    strong: "success",
    good: "warning",
    review: "info",
    new: "default",
  },
};
