import type { StageStripRendererConfig } from "@recruit/shared";

/** The design's board strip: the totals in the kicker, the board behind the
 * link, and one tile per stage. */
const ID = "Recruit.JobDetailPipeline.Component";

export const JobDetailPipelineConfiguration: StageStripRendererConfig = {
  kicker: { name: "kicker" },
  link: { id: ID, routeId: "Recruit.CandidateBoard.Route", label: { name: "openBoard" } },
};
