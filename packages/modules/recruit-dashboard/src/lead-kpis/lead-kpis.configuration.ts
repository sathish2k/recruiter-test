import type { StatCardRendererConfig } from "@recruit/shared";

const value = (path: string) =>
  ({
    type: "number",
    path,
    sx: { fontSize: 30, lineHeight: 1, letterSpacing: "normal" },
  }) as const;

export const LeadKpisConfiguration: StatCardRendererConfig[] = [
  {
    variant: "accent",
    icon: { name: "fact_check" },
    label: { name: "cvsToReview.label" },
    value: value("cvsToReview"),
    sub: { name: "cvsToReview.sub" },
  },
  {
    icon: { name: "handshake" },
    label: { name: "withClients.label" },
    value: value("withClients"),
    sub: { name: "withClients.sub" },
  },
  {
    icon: { name: "task_alt" },
    label: { name: "approvedToSchedule.label" },
    value: value("approvedToSchedule"),
    sub: { name: "approvedToSchedule.sub" },
  },
  {
    icon: { name: "event" },
    label: { name: "interviewsThisWeek.label" },
    value: value("interviewsThisWeek"),
    sub: { name: "interviewsThisWeek.sub" },
  },
];
