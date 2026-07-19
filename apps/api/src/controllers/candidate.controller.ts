import { status } from "elysia";
import type { AuthClaims } from "../plugins/auth-guard";
import {
  type CandidateFilters,
  type CreateCandidateInput,
  createCandidate,
  deleteCandidate,
  getCandidate as getCandidateById,
  listCandidates,
  type UpdateCandidateInput,
  updateCandidate,
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

export async function patchCandidate(ctx: {
  auth: AuthClaims;
  params: { id: string };
  body: UpdateCandidateInput;
}) {
  const candidate = await updateCandidate(
    ctx.params.id,
    ctx.auth.agencyId,
    ctx.body ?? {},
  );
  if (!candidate) return status(404, "Candidate not found");
  return { data: candidate };
}

export async function removeCandidate(ctx: {
  auth: AuthClaims;
  params: { id: string };
}) {
  const result = await deleteCandidate(ctx.params.id, ctx.auth.agencyId);
  if (!result) return status(404, "Candidate not found");
  return { data: result };
}
