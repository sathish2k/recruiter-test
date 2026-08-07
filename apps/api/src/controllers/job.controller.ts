import { status } from "elysia";
import {
  archiveJob,
  createJob,
  deleteJob,
  getJob,
  type JobInput,
  listJobs,
  updateJob,
} from "../services/job.service";
import {
  jobInfo,
  jobKpis,
  jobScreening,
  jobStageStrip,
  jobSummary,
  jobTeam,
  jobTimeline,
} from "../services/job-detail.service";
import { jobStats, jobStatusCounts } from "../services/job-metrics.service";

type Auth = { agencyId?: string | null };

export async function getJobs(ctx: { user: Auth; query: Record<string, string | undefined> }) {
  const organizationId = ctx.user.agencyId ?? "";
  const [{ data, totalCount }, statusCounts] = await Promise.all([
    listJobs(organizationId, {
      search: ctx.query.search,
      // "all" is the tab that means no status filter at all.
      status: ctx.query.status === "all" ? undefined : ctx.query.status,
      clientId: ctx.query.clientId,
      contactId: ctx.query.contactId,
      overdue: ctx.query.overdue === "true",
      page: ctx.query.page ? Number(ctx.query.page) : undefined,
      pageSize: ctx.query.pageSize ? Number(ctx.query.pageSize) : undefined,
      sortKey: ctx.query.sortKey,
      sortDir: ctx.query.sortDir,
    }),
    jobStatusCounts(organizationId),
  ]);
  return { data, meta: { totalCount, statusCounts } };
}

export async function getJobStats(ctx: { user: Auth }) {
  return { data: await jobStats(ctx.user.agencyId ?? "") };
}

export async function getJobById(ctx: { user: Auth; params: { id: string } }) {
  const found = await getJob(ctx.user.agencyId ?? "", ctx.params.id);
  if (!found) return status(404, "Job not found");
  return found;
}

export async function postJob(ctx: { user: Auth; body?: JobInput | null }) {
  const created = await createJob(ctx.user.agencyId ?? "", ctx.body ?? {});
  if (!created) return status(422, "Could not create job");
  return status(201, { data: created });
}

export async function putJob(ctx: { user: Auth; params: { id: string }; body?: JobInput | null }) {
  const updated = await updateJob(ctx.user.agencyId ?? "", ctx.params.id, ctx.body ?? {});
  if (!updated) return status(404, "Job not found");
  return { data: updated };
}

export async function removeJob(ctx: { user: Auth; params: { id: string } }) {
  const deleted = await deleteJob(ctx.user.agencyId ?? "", ctx.params.id);
  if (!deleted) return status(404, "Job not found");
  return { data: deleted };
}

export async function postArchive(ctx: { user: Auth; params: { id: string } }) {
  const archived = await archiveJob(ctx.user.agencyId ?? "", ctx.params.id);
  if (!archived) return status(404, "Requirement not found");
  return { data: archived };
}

/* ── Detail screen ───────────────────────────────────────────────────────── */

/** Each rail and header card reads its own slice, as the client and contact
 * detail screens do — one component, one endpoint. */
async function detail<T>(
  ctx: { user: Auth; params: { id: string } },
  read: (organizationId: string, id: string) => Promise<T | null>,
) {
  const data = await read(ctx.user.agencyId ?? "", ctx.params.id);
  if (!data) return status(404, "Requirement not found");
  return { data };
}

export const getJobSummary = (ctx: { user: Auth; params: { id: string } }) =>
  detail(ctx, jobSummary);
export const getJobKpis = (ctx: { user: Auth; params: { id: string } }) => detail(ctx, jobKpis);
export const getJobTeam = (ctx: { user: Auth; params: { id: string } }) => detail(ctx, jobTeam);
export const getJobTimeline = (ctx: { user: Auth; params: { id: string } }) =>
  detail(ctx, jobTimeline);
export const getJobInfo = (ctx: { user: Auth; params: { id: string } }) => detail(ctx, jobInfo);
export const getJobScreening = (ctx: { user: Auth; params: { id: string } }) =>
  detail(ctx, jobScreening);

/** Ships its own envelope: the strip reads rows from `data` and its totals
 * from `meta`, so it must not be wrapped again. */
export async function getJobStages(ctx: { user: Auth; params: { id: string } }) {
  const found = await jobStageStrip(ctx.user.agencyId ?? "", ctx.params.id);
  if (!found) return status(404, "Requirement not found");
  return found;
}
