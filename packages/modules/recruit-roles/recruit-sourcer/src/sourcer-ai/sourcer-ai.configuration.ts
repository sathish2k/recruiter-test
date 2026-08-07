import type { AiInsightRendererConfig } from "@recruit/shared";

export const SourcerAiConfiguration: AiInsightRendererConfig = {
  title: "title",
  subtitle: "subtitle",
  paths: { count: "count", label: "label", tone: "tone", icon: "icon" },
  cta: {
    id: "Recruit.Sourcer.DashboardAi.Component",
    linkType: "route",
    routeId: "Recruit.Candidates.Route",
    ctaLabel: "cta",
  },
};
