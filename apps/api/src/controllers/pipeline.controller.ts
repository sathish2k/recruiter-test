import { status } from "elysia";
import type { AuthClaims } from "../plugins/auth-guard";
import {
  getPipeline,
  moveCandidateStage,
  type PipelineFilters,
} from "../services/pipeline.service";

export async function getPipelineBoard(ctx: {
  auth: AuthClaims;
  query: PipelineFilters;
}) {
  const board = await getPipeline(ctx.query ?? {}, ctx.auth.agencyId);
  return { data: board };
}

export async function patchCandidateStage(ctx: {
  auth: AuthClaims;
  params: { id: string };
  body: { stage: string };
}) {
  const result = await moveCandidateStage(ctx.params.id, ctx.body.stage);
  if ("error" in result) {
    if (result.error === "invalid-stage") return status(400, "Invalid stage");
    return status(404, "Candidate not found");
  }
  return { data: result.data };
}
