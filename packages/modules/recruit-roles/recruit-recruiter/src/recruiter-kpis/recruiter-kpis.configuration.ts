import type { StatCardRendererConfig } from "@recruit/shared";

/** The four metrics this role opens the day on. */
export const RecruiterKpisConfiguration: StatCardRendererConfig[] = [
  {
    label: { name: "kpis.openJobs" },
    value: { type: "text", path: "openJobs" },
    delta: { name: "kpis.openJobsDelta", value: "openJobsDelta" },
    tone: "primary",
    icon: { name: "work", tone: "primary" },
  },
  {
    label: { name: "kpis.interviewsToday" },
    value: { type: "text", path: "interviewsToday" },
    delta: { name: "kpis.interviewsTodayDelta", value: "interviewsTodayDelta" },
    tone: "info",
    icon: { name: "event", tone: "info" },
  },
  {
    label: { name: "kpis.offersPending" },
    value: { type: "text", path: "offersPending" },
    delta: { name: "kpis.offersPendingDelta", value: "offersPendingDelta" },
    tone: "warning",
    icon: { name: "draft", tone: "warning" },
  },
  {
    label: { name: "kpis.revenueMonth" },
    value: { type: "text", path: "revenueMonth" },
    delta: { name: "kpis.revenueMonthDelta", value: "revenueMonthDelta" },
    tone: "success",
    icon: { name: "payments", tone: "success" },
  },
];
