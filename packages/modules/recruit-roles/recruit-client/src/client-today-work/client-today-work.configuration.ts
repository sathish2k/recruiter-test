import type { TodayWorkRendererConfig } from "@recruit/shared";

export const ClientTodayWorkConfiguration: TodayWorkRendererConfig = {
  title: "title",
  subtitle: "subtitle",
  paths: { count: "count", label: "label", detail: "detail", tone: "tone", icon: "icon" },
  cta: {
    id: "Recruit.Client.DashboardTodayWork.Component",
    linkType: "route",
    routeId: "Recruit.Jobs.Route",
    ctaLabel: "cta",
  },
};
