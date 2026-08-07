import type { StatCardRendererConfig } from "@recruit/shared";

/** The four metrics this role opens the day on. */
export const HiringManagerKpisConfiguration: StatCardRendererConfig[] = [
  {
    label: { name: "kpis.reviewsPending" },
    value: { type: "text", path: "reviewsPending" },
    delta: { name: "kpis.reviewsPendingDelta", value: "reviewsPendingDelta" },
    tone: "warning",
    icon: { name: "rate-review", tone: "warning" },
  },
  {
    label: { name: "kpis.submittedToday" },
    value: { type: "text", path: "submittedToday" },
    delta: { name: "kpis.submittedTodayDelta", value: "submittedTodayDelta" },
    tone: "primary",
    icon: { name: "send", tone: "primary" },
  },
  {
    label: { name: "kpis.interviewsToday" },
    value: { type: "text", path: "interviewsToday" },
    delta: { name: "kpis.interviewsTodayDelta", value: "interviewsTodayDelta" },
    tone: "success",
    icon: { name: "event", tone: "success" },
  },
  {
    label: { name: "kpis.averageReviewTime" },
    value: { type: "text", path: "averageReviewTime" },
    delta: { name: "kpis.averageReviewTimeDelta", value: "averageReviewTimeDelta" },
    tone: "violet",
    icon: { name: "timer", tone: "violet" },
  },
];
