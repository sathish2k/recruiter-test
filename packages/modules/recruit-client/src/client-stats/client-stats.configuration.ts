import type { StatCardRendererConfig } from "@recruit/shared";

const ID = "Recruit.ClientStats.Component";

/** The design's four Clients tiles — each tinted by what it measures, with a
 * 32px icon tile on the card surface and the `md` scale (26px value in an
 * 18/20 card), plus an inline delta beside the value. */
export const ClientStatsConfiguration: StatCardRendererConfig[] = [
  {
    size: "md",
    tone: "success",
    icon: { name: "domain" },
    label: { name: "stats.activeClients" },
    value: { type: "number", path: "active" },
    delta: { name: "stats.hiring", value: "hiring" },
    sub: { name: "stats.addedThisQuarter" },
  },
  {
    size: "md",
    tone: "info",
    icon: { name: "work" },
    label: { name: "stats.requirements" },
    value: { type: "number", path: "openRoles" },
    delta: {
      name: "stats.requirementsDelta",
      value: "clientsWithRoles",
      color: "var(--mui-palette-surface-textMuted)",
    },
  },
  {
    size: "md",
    tone: "primary",
    icon: { name: "timer" },
    label: { name: "stats.avgTimeToHire" },
    value: {
      type: "static-translation",
      id: ID,
      key: "stats.days",
      value: "avgTimeToHire",
    },
    // No delta: the descriptor is a sentence, and beside the value it wraps the
    // tile onto three lines. The design keeps that line under the value.
    sub: { name: "stats.avgTimeToHireDelta" },
  },
  {
    size: "md",
    tone: "violet",
    icon: { name: "handshake" },
    label: { name: "stats.placements" },
    value: { type: "number", path: "placements" },
    delta: {
      name: "stats.placementsDelta",
      color: "var(--mui-palette-surface-successFg)",
    },
  },
];
