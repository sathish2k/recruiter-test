import type { AiInsightRendererConfig } from "@recruit/shared";

export const OwnerAiConfiguration: AiInsightRendererConfig = {
  title: "title",
  subtitle: "subtitle",
  paths: { count: "count", label: "label", tone: "tone", icon: "icon" },
  cta: {
    id: "Recruit.Owner.DashboardAi.Component",
    linkType: "route",
    routeId: "Recruit.Candidates.Route",
    ctaLabel: "cta",
  },
};
