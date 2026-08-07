import { and, count, eq, gte, inArray, lt, ne } from "drizzle-orm";
import { db } from "../db";
import { application } from "../models/application.model";
import { job } from "../models/job.model";
import { listStages } from "./pipeline.service";

/**
 * The figures the requisition list draws — the per-row pipeline/fill/SLA
 * columns and the four tiles above them. Split from `job.service.ts` so the
 * CRUD path stays short, the same way `job-detail.service.ts` is.
 *
 * Every number is derived from application rows; nothing is stored twice.
 */

const DAY_MS = 86_400_000;
const AGEING_DAYS = 30;
const QUARTER_MS = 91 * DAY_MS;
const WEEK_MS = 7 * DAY_MS;

const daysSince = (value?: Date | string | null) => {
  if (!value) return 0;
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return 0;
  return Math.max(0, Math.floor((Date.now() - date.getTime()) / DAY_MS));
};

/** Whole days until `value`; negative once it is in the past. */
const daysUntil = (value?: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return Math.ceil((date.getTime() - Date.now()) / DAY_MS);
};

type Stage = Awaited<ReturnType<typeof listStages>>[number];

/**
 * The pipeline bar has three segments but a board has any number of stages, so
 * the non-hire stages are split into three contiguous bands by position rather
 * than matched by name — a renamed or custom board still lands somewhere sane.
 */
function stageBands(stages: Stage[]) {
  const flow = stages.filter((stage) => stage.kind !== "hire");
  const band = new Map<string, 0 | 1 | 2>();
  const size = flow.length / 3;
  flow.forEach((stage, index) => {
    band.set(stage.id, (size ? Math.min(2, Math.floor(index / size)) : 0) as 0 | 1 | 2);
  });
  return band;
}

/** The days a candidate may sit in a stage — the requirement's override first,
 * then the workspace default. 0 means "no limit". */
const stageSla = (stage: Stage | undefined, overrides?: Record<string, number> | null) => {
  if (!stage) return 0;
  const override = overrides?.[stage.id];
  return Number(override ?? stage.slaDays ?? 0);
};

export interface JobMetrics {
  /** The three bands of the composition bar. Named for their position on the
   * board, not for a stage — a workspace names its own stages. */
  pipelineEarly: number;
  pipelineMid: number;
  pipelineLate: number;
  pipeline: number;
  hires: number;
  /** Whole days since the role opened. */
  ageDays: number;
  /** Days left against the target date; negative once it has passed. */
  slaDays: number;
  slaState: "overdue" | "due" | "ok" | "none";
}

const EMPTY: JobMetrics = {
  pipelineEarly: 0,
  pipelineMid: 0,
  pipelineLate: 0,
  pipeline: 0,
  hires: 0,
  ageDays: 0,
  slaDays: 0,
  slaState: "none",
};

/**
 * Pipeline aggregates for a page of requirements, in one grouped query rather
 * than one per row.
 */
export async function jobMetrics(
  organizationId: string,
  jobs: { id: string; dateOpened?: string | null; targetDate?: string | null; createdAt: Date }[],
): Promise<Record<string, JobMetrics>> {
  const ids = jobs.map((row) => row.id);
  const metrics: Record<string, JobMetrics> = Object.fromEntries(
    jobs.map((row) => {
      const left = daysUntil(row.targetDate);
      return [
        row.id,
        {
          ...EMPTY,
          ageDays: daysSince(row.dateOpened || row.createdAt),
          slaDays: left == null ? 0 : Math.abs(left),
          slaState: left == null ? "none" : left < 0 ? "overdue" : left <= 7 ? "due" : "ok",
        },
      ];
    }),
  );
  if (!ids.length) return metrics;

  const [rows, stages] = await Promise.all([
    db
      .select({
        jobId: application.jobId,
        stageId: application.stageId,
        status: application.status,
        total: count(),
      })
      .from(application)
      .where(and(eq(application.organizationId, organizationId), inArray(application.jobId, ids)))
      .groupBy(application.jobId, application.stageId, application.status),
    listStages(organizationId),
  ]);

  const band = stageBands(stages);
  const columns = ["pipelineEarly", "pipelineMid", "pipelineLate"] as const;

  for (const row of rows) {
    const target = metrics[row.jobId];
    if (!target) continue;
    if (row.status === "hired") {
      target.hires += row.total;
      continue;
    }
    if (row.status !== "active") continue;
    target.pipeline += row.total;
    const column = columns[band.get(row.stageId ?? "") ?? 0];
    if (column) target[column] += row.total;
  }
  return metrics;
}

/** How many live requirements sit in each status — the list's status tabs. */
export async function jobStatusCounts(organizationId: string) {
  const rows = await db
    .select({ status: job.status, total: count() })
    .from(job)
    .where(and(eq(job.organizationId, organizationId), eq(job.archived, false)))
    .groupBy(job.status);
  const counts = Object.fromEntries(rows.map((row) => [row.status, row.total]));
  return {
    all: rows.reduce((sum, row) => sum + row.total, 0),
    open: counts.open ?? 0,
    on_hold: counts.on_hold ?? 0,
    filled: counts.filled ?? 0,
    closed: counts.closed ?? 0,
  };
}

/**
 * The four tiles above the list. "Awaiting client decision" counts the
 * applications parked in a stage the client can see — those are the ones a
 * recruiter is chasing feedback on — and marks the ones past that stage's SLA.
 */
export async function jobStats(organizationId: string) {
  const live = and(eq(job.organizationId, organizationId), eq(job.archived, false));
  const weekAgo = new Date(Date.now() - WEEK_MS);
  const quarterAgo = new Date(Date.now() - QUARTER_MS);
  const priorQuarter = new Date(Date.now() - 2 * QUARTER_MS);

  const [openRows, waitingRows, stages, filledRows, priorRow] = await Promise.all([
    db
      .select({
        id: job.id,
        clientId: job.clientId,
        dateOpened: job.dateOpened,
        createdAt: job.createdAt,
      })
      .from(job)
      .where(and(live, eq(job.status, "open"))),
    db
      .select({
        stageId: application.stageId,
        stageEnteredAt: application.stageEnteredAt,
        stageSlas: job.stageSlas,
      })
      .from(application)
      .innerJoin(job, eq(application.jobId, job.id))
      .where(and(live, eq(application.status, "active"))),
    listStages(organizationId),
    db
      .select({ createdAt: job.createdAt, updatedAt: job.updatedAt })
      .from(job)
      .where(and(live, eq(job.status, "filled"), gte(job.updatedAt, quarterAgo))),
    db
      .select({ total: count() })
      .from(job)
      .where(
        and(
          live,
          eq(job.status, "filled"),
          gte(job.updatedAt, priorQuarter),
          lt(job.updatedAt, quarterAgo),
        ),
      ),
  ]);

  const visible = new Map(stages.filter((stage) => stage.clientVisible).map((s) => [s.id, s]));
  let waiting = 0;
  let pastSla = 0;
  let oldest = 0;
  for (const row of waitingRows) {
    const stage = visible.get(row.stageId ?? "");
    if (!stage) continue;
    waiting += 1;
    const held = daysSince(row.stageEnteredAt);
    oldest = Math.max(oldest, held);
    const limit = stageSla(stage, row.stageSlas);
    if (limit > 0 && held > limit) pastSla += 1;
  }

  const ageing = openRows.filter(
    (row) => daysSince(row.dateOpened || row.createdAt) > AGEING_DAYS,
  ).length;
  const openedThisWeek = openRows.filter((row) => row.createdAt >= weekAgo).length;
  const clients = new Set(openRows.map((row) => row.clientId).filter(Boolean)).size;

  const cycles = filledRows
    .map((row) => Math.floor((row.updatedAt.getTime() - row.createdAt.getTime()) / DAY_MS))
    .filter((value) => value >= 0);
  const avgTimeToHire = cycles.length
    ? Math.round(cycles.reduce((sum, value) => sum + value, 0) / cycles.length)
    : 0;
  const prior = priorRow[0]?.total ?? 0;
  const filled = filledRows.length;

  return {
    open: openRows.length,
    clients,
    openedThisWeek,
    ageing,
    waiting,
    pastSla,
    oldest,
    filled,
    // No prior quarter to compare against reads as no movement, not +100%.
    filledDelta: prior ? Math.round(((filled - prior) / prior) * 100) : 0,
    avgTimeToHire,
  };
}

/** Requirements whose target date has passed and are still open — the list's
 * "Past SLA only" toggle, resolved to ids the list query can filter on. */
export async function overdueJobIds(organizationId: string) {
  const rows = await db
    .select({ id: job.id, targetDate: job.targetDate })
    .from(job)
    .where(
      and(
        eq(job.organizationId, organizationId),
        eq(job.archived, false),
        ne(job.status, "closed"),
      ),
    );
  return rows
    .filter((row) => {
      const left = daysUntil(row.targetDate);
      return left != null && left < 0;
    })
    .map((row) => row.id);
}
