import type { MessageAlertRendererConfig } from "@recruit/shared";

export const DashboardInsightConfiguration: MessageAlertRendererConfig = {
  tone: "accent",
  icon: "sparkle",
  prefix: { name: "prefix" },
  message: { name: "message" },
  cta: { name: "cta" },
  showPath: "resumesToReview",
  link: {
    id: "Recruit.DashboardInsight.Component",
    linkType: "route",
    routeId: "Recruit.AiScreening.Route",
    target: "_self",
    color: "inherit",
    underline: "none",
  },
};
