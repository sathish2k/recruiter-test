import type { LinkRendererConfig } from "@recruit/shared";

export interface CvReviewConfig {
  backLink: LinkRendererConfig;
  selfRouteId: string;
  queueRouteId: string;
  bounceReasons: string[];
}

export const CvReviewConfiguration: CvReviewConfig = {
  backLink: {
    routeId: "Recruit.Candidates.Route",
    label: { name: "back" },
  },
  selfRouteId: "Recruit.CvReview.Route",
  queueRouteId: "Recruit.Candidates.Route",
  bounceReasons: [
    "bounce.reasons.underqualified",
    "bounce.reasons.comp",
    "bounce.reasons.location",
    "bounce.reasons.domain",
    "bounce.reasons.other",
  ],
};
