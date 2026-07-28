import { status } from "elysia";
import { record as recordAudit } from "../services/audit-log.service";
import {
  archiveCandidate,
  type CandidateInput,
  createCandidate,
  deleteCandidate,
  getCandidate,
  listCandidates,
  updateCandidate,
} from "../services/candidate.service";

type Auth = { agencyId?: string | null; id?: string; name?: string | null };

/** Pipeline movement is logged to the audit feed with a stable `details.stage`,
 * which is what the dashboard's activity chart counts per day. Prose in `event`
 * is for humans reading the feed — never parse it. */
async function recordStage(
  ctx: { user: Auth },
  candidate: { name?: string; startingStage?: string },
  stage: string,
) {
  await recordAudit({
    organizationId: ctx.user.agencyId ?? "",
    userId: ctx.user.id,
    actorName: ctx.user.name ?? "Unknown",
    event: `${candidate.name ?? "Candidate"} moved to ${stage}`,
    category: "candidates",
    objects: candidate.name ? { Candidate: candidate.name } : undefined,
    details: { stage },
  });
}

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
  if (created.startingStage) await recordStage(ctx, created, created.startingStage);
  return status(201, { data: created });
}

export async function putCandidate(ctx: {
  user: Auth;
  params: { id: string };
  body?: CandidateInput | null;
}) {
  const before = await getCandidate(ctx.user.agencyId ?? "", ctx.params.id);
  const updated = await updateCandidate(ctx.user.agencyId ?? "", ctx.params.id, ctx.body ?? {});
  if (!updated) return status(404, "Candidate not found");
  if (updated.startingStage && updated.startingStage !== before?.startingStage) {
    await recordStage(ctx, updated, updated.startingStage);
  }
  if (updated.status === "placed" && before?.status !== "placed") {
    await recordStage(ctx, updated, "placed");
  }
  return { data: updated };
}

export async function removeCandidate(ctx: { user: Auth; params: { id: string } }) {
  const deleted = await deleteCandidate(ctx.user.agencyId ?? "", ctx.params.id);
  if (!deleted) return status(404, "Candidate not found");
  return { data: deleted };
}

export async function postArchive(ctx: { user: Auth; params: { id: string } }) {
  const archived = await archiveCandidate(ctx.user.agencyId ?? "", ctx.params.id);
  if (!archived) return status(404, "Candidate not found");
  return { data: archived };
}
