import type { AiInsightRendererConfig } from "@recruit/shared";

export const AccountManagerAiConfiguration: AiInsightRendererConfig = {
  title: "title",
  subtitle: "subtitle",
  paths: { count: "count", label: "label", tone: "tone", icon: "icon" },
  cta: {
    id: "Recruit.AccountManager.DashboardAi.Component",
    linkType: "route",
    routeId: "Recruit.Candidates.Route",
    ctaLabel: "cta",
  },
};
