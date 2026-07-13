import type { AuthClaims } from "../plugins/auth-guard";
import {
  type CandidateFilters,
  listCandidates,
} from "../services/candidate.service";

export async function getCandidates(ctx: {
  auth: AuthClaims;
  query: CandidateFilters;
}) {
  const { data, totalCount } = await listCandidates(ctx.query ?? {});
  return { data, meta: { totalCount } };
}
