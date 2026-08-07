import type { StatCardRendererConfig } from "@recruit/shared";

/** The design's four Candidates tiles — the same `md` scale as the Clients row
 * (32px icon tile on the card surface, 26px value, inline delta, sub line),
 * each tinted by what it measures. */
export const CandidateStatsConfiguration: StatCardRendererConfig[] = [
  {
    size: "md",
    tone: "primary",
    icon: { name: "group" },
    label: { name: "stats.inPool" },
    value: { type: "number", path: "inPool" },
    delta: { name: "stats.inPoolDelta", value: "addedThisMonth" },
    sub: { name: "stats.thisMonth" },
  },
  {
    size: "md",
    tone: "info",
    icon: { name: "send" },
    label: { name: "stats.submitted" },
    value: { type: "number", path: "submitted" },
    delta: { name: "stats.submittedDelta", value: "submittedWaiting" },
    sub: { name: "stats.submittedSub" },
  },
  {
    size: "md",
    tone: "violet",
    icon: { name: "auto-awesome" },
    label: { name: "stats.strongMatch" },
    value: { type: "number", path: "strongMatch" },
    delta: { name: "stats.strongMatchDelta", value: "strongMatchUnviewed" },
    sub: { name: "stats.strongMatchSub" },
  },
  {
    size: "md",
    tone: "success",
    icon: { name: "handshake" },
    label: { name: "stats.joined" },
    value: { type: "number", path: "joined" },
    delta: { name: "stats.joinedDelta", value: "joinedThisYear" },
    sub: { name: "stats.yearToDate" },
  },
];
