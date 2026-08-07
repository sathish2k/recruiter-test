import type { StatCardRendererConfig } from "@recruit/shared";

/** The four metrics this role opens the day on. */
export const OwnerKpisConfiguration: StatCardRendererConfig[] = [
  {
    label: { name: "kpis.revenueMonth" },
    value: { type: "text", path: "revenueMonth" },
    delta: { name: "kpis.revenueMonthDelta", value: "revenueMonthDelta" },
    tone: "success",
    icon: { name: "payments", tone: "success" },
  },
  {
    label: { name: "kpis.placements" },
    value: { type: "text", path: "placements" },
    delta: { name: "kpis.placementsDelta", value: "placementsDelta" },
    tone: "violet",
    icon: { name: "handshake", tone: "violet" },
  },
  {
    label: { name: "kpis.outstanding" },
    value: { type: "text", path: "outstanding" },
    delta: { name: "kpis.outstandingDelta", value: "outstandingDelta" },
    tone: "error",
    icon: { name: "receipt-long", tone: "error" },
  },
  {
    label: { name: "kpis.interviewsToday" },
    value: { type: "text", path: "interviewsToday" },
    delta: { name: "kpis.interviewsTodayDelta", value: "interviewsTodayDelta" },
    tone: "primary",
    icon: { name: "event", tone: "primary" },
  },
];
