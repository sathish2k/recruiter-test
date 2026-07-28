import type { StatCardRendererConfig } from "@recruit/shared";

const CLIENT_PARAM = { id: { type: "dynamic" as const, path: "id" } };

/** The design's four tiles: a value with its qualifier inline, colour-coded by
 * what the qualifier says rather than by the metric. */
export const ClientDetailStatsConfiguration: StatCardRendererConfig[] = [
  {
    size: "compact",
    label: { name: "metrics.openJobs" },
    value: { type: "number", path: "openJobs" },
    delta: {
      name: "metrics.openJobsDelta",
      value: "onHoldJobs",
      color: "var(--mui-palette-surface-textSecondary)",
    },
    link: { routeId: "Recruit.Jobs.Route", queryParams: CLIENT_PARAM },
  },
  {
    size: "compact",
    label: { name: "metrics.candidates" },
    value: { type: "number", path: "activeCandidates" },
    delta: {
      name: "metrics.candidatesDelta",
      color: "var(--mui-palette-surface-successFg)",
    },
  },
  {
    size: "compact",
    label: { name: "metrics.placements" },
    value: { type: "number", path: "placements" },
    delta: {
      name: "metrics.placementsDelta",
      value: "avgTimeToHire",
      color: "var(--mui-palette-surface-successFg)",
    },
  },
  {
    size: "compact",
    label: { name: "metrics.revenue" },
    value: { type: "currency", path: "revenue", currency: "INR", compact: true },
    delta: {
      name: "metrics.revenueDelta",
      value: "outstanding",
      color: "var(--mui-palette-surface-warningFg)",
    },
  },
];
