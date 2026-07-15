export interface LeadKpiCard {
  key: string;
  label: string;
  sub: string;
  icon: string;
  variant: "accent" | "base";
}

export interface LeadKpisConfig {
  cards: LeadKpiCard[];
}

export const LeadKpisConfiguration: LeadKpisConfig = {
  cards: [
    {
      key: "cvsToReview",
      label: "cvsToReview.label",
      sub: "cvsToReview.sub",
      icon: "fact_check",
      variant: "accent",
    },
    {
      key: "withClients",
      label: "withClients.label",
      sub: "withClients.sub",
      icon: "handshake",
      variant: "base",
    },
    {
      key: "approvedToSchedule",
      label: "approvedToSchedule.label",
      sub: "approvedToSchedule.sub",
      icon: "task_alt",
      variant: "base",
    },
    {
      key: "interviewsThisWeek",
      label: "interviewsThisWeek.label",
      sub: "interviewsThisWeek.sub",
      icon: "event",
      variant: "base",
    },
  ],
};
