import type { ProgressCardRendererConfig } from "@recruit/shared";

export const RecruiterMyPipelineConfiguration: ProgressCardRendererConfig = {
  title: "title",
  icon: "view-kanban",
  tone: "primary",
  paths: { label: "label", value: "value", tone: "tone", flag: "flag" },
  cta: {
    id: "Recruit.Recruiter.DashboardMyPipeline.Component",
    linkType: "route",
    routeId: "Recruit.CandidateBoard.Route",
    ctaLabel: "cta",
  },
};
