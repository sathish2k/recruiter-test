import type { StatCardRendererConfig } from "@recruit/shared";

/** The four metrics this role opens the day on. */
export const ClientKpisConfiguration: StatCardRendererConfig[] = [
  {
    label: { name: "kpis.awaitingYou" },
    value: { type: "text", path: "awaitingYou" },
    delta: { name: "kpis.awaitingYouDelta", value: "awaitingYouDelta" },
    tone: "warning",
    icon: { name: "rate-review", tone: "warning" },
  },
  {
    label: { name: "kpis.interviewsToday" },
    value: { type: "text", path: "interviewsToday" },
    delta: { name: "kpis.interviewsTodayDelta", value: "interviewsTodayDelta" },
    tone: "info",
    icon: { name: "event", tone: "info" },
  },
  {
    label: { name: "kpis.openRoles" },
    value: { type: "text", path: "openRoles" },
    delta: { name: "kpis.openRolesDelta", value: "openRolesDelta" },
    tone: "primary",
    icon: { name: "work", tone: "primary" },
  },
  {
    label: { name: "kpis.hires" },
    value: { type: "text", path: "hires" },
    delta: { name: "kpis.hiresDelta", value: "hiresDelta" },
    tone: "success",
    icon: { name: "handshake", tone: "success" },
  },
];
