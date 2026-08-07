import type { TodayWorkRendererConfig } from "@recruit/shared";

export const HiringManagerTodayWorkConfiguration: TodayWorkRendererConfig = {
  title: "title",
  subtitle: "subtitle",
  paths: { count: "count", label: "label", detail: "detail", tone: "tone", icon: "icon" },
  cta: {
    id: "Recruit.HiringManager.DashboardTodayWork.Component",
    linkType: "route",
    routeId: "Recruit.Jobs.Route",
    ctaLabel: "cta",
  },
};
