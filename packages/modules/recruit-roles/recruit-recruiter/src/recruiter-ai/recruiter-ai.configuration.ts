import type { AiInsightRendererConfig } from "@recruit/shared";

export const RecruiterAiConfiguration: AiInsightRendererConfig = {
  title: "title",
  subtitle: "subtitle",
  paths: { count: "count", label: "label", tone: "tone", icon: "icon" },
  cta: {
    id: "Recruit.Recruiter.DashboardAi.Component",
    linkType: "route",
    routeId: "Recruit.Candidates.Route",
    ctaLabel: "cta",
  },
};
