import { status } from "elysia";
import { record as recordAudit } from "../services/audit-log.service";
import {
  archiveCandidate,
  type CandidateInput,
  createCandidate,
  deleteCandidate,
  findDuplicateCandidates,
  getCandidate,
  type ImportRow,
  importCandidates,
  listCandidates,
  type MergeInput,
  mergeCandidate,
  updateCandidate,
} from "../services/candidate.service";
import {
  type CandidateWorkspaceTab,
  candidateActions,
  candidateAssessment,
  candidateAssignment,
  candidateDetails,
  candidateSummary,
  candidateWorkspace,
} from "../services/candidate-detail.service";

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

export async function getDuplicates(ctx: {
  user: Auth;
  query: Record<string, string | undefined>;
}) {
  const data = await findDuplicateCandidates(ctx.user.agencyId ?? "", {
    email: ctx.query.email,
    secondaryEmail: ctx.query.secondaryEmail,
    phone: ctx.query.phone,
    mobile: ctx.query.mobile,
    linkedin: ctx.query.linkedin,
    excludeId: ctx.query.excludeId,
  });
  return { data };
}

export async function postMerge(ctx: {
  user: Auth;
  params: { id: string };
  body?: MergeInput | null;
}) {
  if (!ctx.body?.values) return status(422, "Nothing to merge");
  try {
    const merged = await mergeCandidate(ctx.user.agencyId ?? "", ctx.params.id, ctx.body);
    if (!merged) return status(404, "Candidate not found");
    return { data: merged };
  } catch (error) {
    return status(422, (error as Error).message);
  }
}

export async function postImport(ctx: {
  user: Auth;
  body?: { rows?: ImportRow[]; defaults?: CandidateInput } | null;
}) {
  const rows = ctx.body?.rows ?? [];
  if (!rows.length) return status(422, "Nothing to import");
  const results = await importCandidates(ctx.user.agencyId ?? "", rows, ctx.body?.defaults ?? {});
  const tally = (outcome: string) => results.filter((row) => row.status === outcome).length;
  return {
    data: results,
    meta: {
      created: tally("created"),
      merged: tally("merged"),
      skipped: tally("skipped"),
      duplicates: tally("duplicate"),
    },
  };
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

/* ── Detail screen ───────────────────────────────────────────────────────── */

/** One endpoint per card, as the client and contact detail screens do. */
async function detail<T>(
  ctx: { user: Auth; params: { id: string } },
  read: (organizationId: string, id: string) => Promise<T | null>,
) {
  const data = await read(ctx.user.agencyId ?? "", ctx.params.id);
  if (!data) return status(404, "Candidate not found");
  return { data };
}

export const getCandidateSummary = (ctx: { user: Auth; params: { id: string } }) =>
  detail(ctx, candidateSummary);
export const getCandidateAssessment = (ctx: { user: Auth; params: { id: string } }) =>
  detail(ctx, candidateAssessment);
export const getCandidateDetails = (ctx: { user: Auth; params: { id: string } }) =>
  detail(ctx, candidateDetails);
export const getCandidateAssignment = (ctx: { user: Auth; params: { id: string } }) =>
  detail(ctx, candidateAssignment);
export const getCandidateActions = (ctx: { user: Auth; params: { id: string } }) =>
  detail(ctx, candidateActions);

export async function getCandidateWorkspace(ctx: {
  user: Auth;
  params: { id: string };
  query: Record<string, string | undefined>;
}) {
  const tab = (ctx.query.tab ?? "applications") as CandidateWorkspaceTab;
  const data = await candidateWorkspace(ctx.user.agencyId ?? "", ctx.params.id, tab);
  return { data };
}
