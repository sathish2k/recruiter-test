import type { ProgressCardRendererConfig } from "@recruit/shared";

export const HiringManagerMyPipelineConfiguration: ProgressCardRendererConfig = {
  title: "title",
  icon: "view-kanban",
  tone: "primary",
  paths: { label: "label", value: "value", tone: "tone", flag: "flag" },
  cta: {
    id: "Recruit.HiringManager.DashboardMyPipeline.Component",
    linkType: "route",
    routeId: "Recruit.CandidateBoard.Route",
    ctaLabel: "cta",
  },
};
