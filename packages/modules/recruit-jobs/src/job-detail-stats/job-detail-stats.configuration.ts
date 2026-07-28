import type { StatCardRendererConfig } from "@recruit/shared";

const JOB_PARAM = { jobId: { type: "dynamic" as const, path: "id" } };

/** The design's hiring-progress row: the count, the qualifier that says what
 * needs doing about it, and the list each tile drills into. */
export const JobDetailStatsConfiguration: StatCardRendererConfig[] = [
  {
    size: "compact",
    label: { name: "metrics.submitted" },
    value: { type: "number", path: "submitted" },
    delta: {
      name: "metrics.submittedDelta",
      value: "awaiting",
      color: "var(--mui-palette-surface-warningFg)",
    },
    link: { routeId: "Recruit.Candidates.Route", queryParams: JOB_PARAM },
  },
  {
    size: "compact",
    label: { name: "metrics.interviews" },
    value: { type: "number", path: "interviews" },
    delta: {
      name: "metrics.interviewsDelta",
      value: "interviewing",
      color: "var(--mui-palette-surface-textSecondary)",
    },
  },
  {
    size: "compact",
    label: { name: "metrics.offers" },
    value: { type: "number", path: "offers", color: "var(--mui-palette-surface-accentBright)" },
    delta: {
      name: "metrics.offersDelta",
      value: "offerWaitingDays",
      color: "var(--mui-palette-surface-warningFg)",
    },
  },
  {
    size: "compact",
    label: { name: "metrics.hires" },
    value: { type: "number", path: "hires" },
    delta: {
      name: "metrics.hiresDelta",
      value: "openingsRemaining",
      color: "var(--mui-palette-surface-textSecondary)",
    },
  },
];
