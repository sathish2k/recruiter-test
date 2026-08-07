import type { StatCardRendererConfig } from "@recruit/shared";

/** The design's four Requisitions tiles — each tinted by what it measures,
 * with a 32px icon tile on the card surface and the `md` scale. */
export const JobStatsConfiguration: StatCardRendererConfig[] = [
  {
    size: "md",
    tone: "primary",
    icon: { name: "work" },
    label: { name: "stats.open" },
    value: { type: "number", path: "open" },
    delta: { name: "stats.openDelta", value: "clients" },
    sub: { name: "stats.openedThisWeek" },
  },
  {
    size: "md",
    tone: "info",
    icon: { name: "send" },
    label: { name: "stats.waiting" },
    value: { type: "number", path: "waiting" },
    delta: {
      name: "stats.waitingDelta",
      value: "pastSla",
      color: "var(--mui-palette-surface-warningFg)",
    },
    sub: { name: "stats.oldest" },
  },
  {
    size: "md",
    tone: "warning",
    icon: { name: "hourglass" },
    label: { name: "stats.ageing" },
    value: { type: "number", path: "ageing" },
    delta: {
      name: "stats.ageingDelta",
      value: "open",
      color: "var(--mui-palette-surface-textSecondary)",
    },
    sub: { name: "stats.ageingNote" },
  },
  {
    size: "md",
    tone: "success",
    icon: { name: "handshake" },
    label: { name: "stats.filled" },
    value: { type: "number", path: "filled" },
    delta: {
      name: "stats.filledDelta",
      value: "filledDelta",
      color: "var(--mui-palette-surface-successFg)",
    },
    sub: { name: "stats.avgTimeToHire" },
  },
];
