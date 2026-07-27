import type { StatCardRendererConfig } from "@recruit/shared";

const ID = "Recruit.ClientStats.Component";

/** The design's four Clients tiles — the `sm` scale (25px value in a 16/18
 * card), with an inline accent delta rather than the dashboard's pill. */
export const ClientStatsConfiguration: StatCardRendererConfig[] = [
  {
    size: "sm",
    label: { name: "stats.activeClients" },
    value: { type: "number", path: "active" },
    delta: { name: "stats.hiring", value: "hiring" },
    sub: { name: "stats.addedThisQuarter" },
  },
  {
    size: "sm",
    label: { name: "stats.requirements" },
    value: { type: "number", path: "openRoles" },
    delta: { name: "stats.requirementsDelta", value: "clientsWithRoles" },
  },
  {
    size: "sm",
    label: { name: "stats.avgTimeToHire" },
    value: {
      type: "static-translation",
      id: ID,
      key: "stats.days",
      value: "avgTimeToHire",
    },
    delta: {
      name: "stats.avgTimeToHireDelta",
      color: "var(--mui-palette-surface-successFg)",
    },
  },
  {
    size: "sm",
    label: { name: "stats.placements" },
    value: { type: "number", path: "placements" },
    delta: { name: "stats.placementsDelta" },
  },
];
