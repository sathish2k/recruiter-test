import { status } from "elysia";
import {
  type CandidateInput,
  createCandidate,
  deleteCandidate,
  getCandidate,
  listCandidates,
  updateCandidate,
} from "../services/candidate.service";

type Auth = { agencyId?: string | null };

export async function getCandidates(ctx: {
  user: Auth;
  query: Record<string, string | undefined>;
}) {
  const { data, totalCount } = await listCandidates(ctx.user.agencyId ?? "", {
    search: ctx.query.search,
    status: ctx.query.status,
    jobId: ctx.query.jobId,
    page: ctx.query.page ? Number(ctx.query.page) : undefined,
    pageSize: ctx.query.pageSize ? Number(ctx.query.pageSize) : undefined,
    sortKey: ctx.query.sortKey,
    sortDir: ctx.query.sortDir,
  });
  return { data, meta: { totalCount } };
}

export async function getCandidateById(ctx: { user: Auth; params: { id: string } }) {
  const found = await getCandidate(ctx.user.agencyId ?? "", ctx.params.id);
  if (!found) return status(404, "Candidate not found");
  return found;
}

export async function postCandidate(ctx: { user: Auth; body?: CandidateInput | null }) {
  const created = await createCandidate(ctx.user.agencyId ?? "", ctx.body ?? {});
  if (!created) return status(422, "Could not create candidate");
  return status(201, { data: created });
}

export async function putCandidate(ctx: {
  user: Auth;
  params: { id: string };
  body?: CandidateInput | null;
}) {
  const updated = await updateCandidate(ctx.user.agencyId ?? "", ctx.params.id, ctx.body ?? {});
  if (!updated) return status(404, "Candidate not found");
  return { data: updated };
}

export async function removeCandidate(ctx: { user: Auth; params: { id: string } }) {
  const deleted = await deleteCandidate(ctx.user.agencyId ?? "", ctx.params.id);
  if (!deleted) return status(404, "Candidate not found");
  return { data: deleted };
}
