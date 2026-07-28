import type { StatCardRendererConfig } from "@recruit/shared";

/** The design's three tiles between the waiting card and the tabs: a value
 * with its qualifier inline, tinted by what the qualifier says. */
export const ContactDetailStatsConfiguration: StatCardRendererConfig[] = [
  {
    size: "compact",
    label: { name: "metrics.openRoles" },
    value: { type: "number", path: "openJobs" },
    delta: {
      name: "metrics.openRolesDelta",
      value: "namedRoles",
      color: "var(--mui-palette-surface-textSecondary)",
    },
    link: { routeId: "Recruit.Jobs.Route" },
  },
  {
    size: "compact",
    label: { name: "metrics.waiting" },
    value: { type: "number", path: "waiting", color: "var(--mui-palette-surface-accentBright)" },
    delta: {
      name: "metrics.waitingDelta",
      value: "oldestHours",
      color: "var(--mui-palette-surface-warningFg)",
    },
  },
  {
    size: "compact",
    label: { name: "metrics.response" },
    value: { type: "text", path: "avgReplyLabel" },
    delta: {
      name: "metrics.responseDelta",
      value: "fasterThan",
      color: "var(--mui-palette-surface-successFg)",
    },
  },
];
