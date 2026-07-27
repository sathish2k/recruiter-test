import type { StageFunnelRendererConfig } from "@recruit/shared";

export const DashboardPipelineConfiguration: StageFunnelRendererConfig = {
  title: { name: "title" },
  stageLabelPrefix: "stages.",
  conversionFormat: { name: "conversion" },
  overallFormat: { name: "overall" },
  link: {
    id: "Recruit.DashboardPipeline.Component",
    linkType: "route",
    routeId: "Recruit.Pipeline.Route",
    label: { name: "viewPipeline" },
    target: "_self",
    color: "inherit",
    underline: "none",
  },
  insight: {
    name: "insight",
    icon: "warning",
    showKey: "bottleneckCount",
  },
  barHeight: 104,
};
