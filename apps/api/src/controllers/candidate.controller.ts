import { status } from "elysia";
import type { AuthClaims } from "../plugins/auth-guard";
import {
  type CandidateFilters,
  type CreateCandidateInput,
  createCandidate,
  getCandidate as getCandidateById,
  listCandidates,
} from "../services/candidate.service";

export async function getCandidates(ctx: {
  auth: AuthClaims;
  query: CandidateFilters;
}) {
  const { data, totalCount } = await listCandidates(
    ctx.auth.agencyId,
    ctx.query ?? {},
  );
  return { data, meta: { totalCount } };
}

export async function getCandidate(ctx: {
  auth: AuthClaims;
  params: { id: string };
}) {
  const candidate = await getCandidateById(
    ctx.params.id,
    ctx.auth.agencyId,
    ctx.auth.sub,
  );
  if (!candidate) return status(404, "Candidate not found");
  return { data: candidate };
}

export async function postCandidate(ctx: {
  auth: AuthClaims;
  body: CreateCandidateInput;
}) {
  return createCandidate(ctx.body, ctx.auth.agencyId);
}
