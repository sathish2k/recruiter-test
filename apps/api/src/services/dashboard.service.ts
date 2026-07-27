import { and, asc, count, desc, eq, gte, inArray, lt, type SQL, sql } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import { db } from "../db";
import { auditLog } from "../models/audit-log.model";
import { user } from "../models/auth.model";
import { type CandidateStatus, candidate } from "../models/candidate.model";
import { client } from "../models/client.model";
import { interview } from "../models/interview.model";
import { invitation } from "../models/invitation.model";
import { job } from "../models/job.model";

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;
const MONTH_MS = 30 * DAY_MS;

/** Statuses that count as "in play" for the active-candidates KPI. */
const ACTIVE_STATUSES: CandidateStatus[] = ["new", "active"];

/** Board order of the candidate pipeline (the form's `startingStage` enum). */
const PIPELINE_STAGES = ["sourced", "screening", "submitted", "interview", "offer"] as const;

/** Stages where work can pile up — "offer" is the end of the board. */
const WORKING_STAGES: readonly string[] = PIPELINE_STAGES.slice(0, -1);

async function stageCounts(organizationId: string): Promise<Map<string, number>> {
  const rows = await db
    .select({ stage: candidate.startingStage, total: count() })
    .from(candidate)
    .where(eq(candidate.organizationId, organizationId))
    .groupBy(candidate.startingStage);
  return new Map(rows.map((row) => [row.stage ?? "", Number(row.total)]));
}

async function total(table: PgTable, where: SQL | undefined) {
  const [row] = await db.select({ total: count() }).from(table).where(where);
  return Number(row?.total ?? 0);
}

/** Whole-number percentage change of `current` against `previous`. */
function deltaPercent(current: number, previous: number) {
  if (previous <= 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

/**
 * One aggregate for the whole dashboard: the three KPI tiles plus the counts
 * the welcome banner links to. Joined here so the screen stays a single fetch.
 * Pipeline stages are the candidate form's `startingStage` values.
 */
export async function dashboardSummary(organizationId: string) {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - WEEK_MS);
  const monthAgo = new Date(now.getTime() - MONTH_MS);

  const inJobs = eq(job.organizationId, organizationId);
  const inCandidates = eq(candidate.organizationId, organizationId);
  const inClients = eq(client.organizationId, organizationId);

  const [
    openRoles,
    openedThisWeek,
    activeCandidates,
    activeCandidatesLastMonth,
    submissions,
    interviews,
    resumesToReview,
    clientsAtRisk,
  ] = await Promise.all([
    total(job, and(inJobs, eq(job.status, "open"))),
    total(job, and(inJobs, eq(job.status, "open"), gte(job.createdAt, weekAgo))),
    total(candidate, and(inCandidates, inArray(candidate.status, ACTIVE_STATUSES))),
    total(
      candidate,
      and(
        inCandidates,
        inArray(candidate.status, ACTIVE_STATUSES),
        lt(candidate.createdAt, monthAgo),
      ),
    ),
    total(candidate, and(inCandidates, eq(candidate.startingStage, "submitted"))),
    total(candidate, and(inCandidates, eq(candidate.startingStage, "interview"))),
    total(candidate, and(inCandidates, eq(candidate.startingStage, "screening"))),
    total(client, and(inClients, eq(client.health, "at_risk"))),
  ]);

  return {
    openRoles,
    openedThisWeek,
    activeCandidates,
    activeCandidatesDelta: deltaPercent(activeCandidates, activeCandidatesLastMonth),
    submissions,
    // Submitted candidates are the ones sitting with the client for review.
    awaitingReview: submissions,
    interviews,
    resumesToReview,
    clientsAtRisk,
    ...(await pipelineBottleneck(organizationId)),
  };
}

/** The working stage holding the most candidates — where work is piling up.
 * Returns an empty stage when the board is empty, so the alert stays hidden. */
async function pipelineBottleneck(organizationId: string) {
  const counts = await stageCounts(organizationId);
  let bottleneckStage = "";
  let bottleneckCount = 0;
  for (const stage of WORKING_STAGES) {
    const stageTotal = counts.get(stage) ?? 0;
    if (stageTotal > bottleneckCount) {
      bottleneckStage = stage;
      bottleneckCount = stageTotal;
    }
  }
  return { bottleneckStage, bottleneckCount };
}

/**
 * The pipeline board as chart rows: one per stage, with its share of the first
 * stage (`pct`) and its conversion from the stage before it.
 */
export async function dashboardPipeline(organizationId: string) {
  const counts = await stageCounts(organizationId);
  const bottleneck = await pipelineBottleneck(organizationId);
  // Share of the *widest* stage, not the first — a later stage can hold more
  // than the one before it, which would push `pct` past 100.
  const baseline = Math.max(0, ...PIPELINE_STAGES.map((stage) => counts.get(stage) ?? 0));

  const stages = PIPELINE_STAGES.map((stage, index) => {
    const stageTotal = counts.get(stage) ?? 0;
    const previousStage = PIPELINE_STAGES[index - 1];
    const previous = previousStage ? (counts.get(previousStage) ?? 0) : 0;
    return {
      key: stage,
      count: stageTotal,
      pct: baseline > 0 ? Math.round((stageTotal / baseline) * 100) : 0,
      conversion: previous > 0 ? Math.round((stageTotal / previous) * 100) : null,
    };
  });

  return { stages, ...bottleneck };
}

/**
 * The soonest upcoming interview, flattened for the dashboard card: who, for
 * which role and client, when, and how to join. Returns null when nothing is
 * booked — the card hides itself rather than showing an empty shell.
 */
export async function dashboardNextInterview(organizationId: string) {
  const [row] = await db
    .select({
      id: interview.id,
      candidateId: interview.candidateId,
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      jobTitle: job.title,
      clientName: client.name,
      scheduledAt: interview.scheduledAt,
      durationMinutes: interview.durationMinutes,
      kind: interview.kind,
      meetingUrl: interview.meetingUrl,
    })
    .from(interview)
    .leftJoin(candidate, eq(interview.candidateId, candidate.id))
    .leftJoin(job, eq(interview.jobId, job.id))
    .leftJoin(client, eq(interview.clientId, client.id))
    .where(
      and(
        eq(interview.organizationId, organizationId),
        eq(interview.status, "scheduled"),
        gte(interview.scheduledAt, new Date()),
      ),
    )
    .orderBy(asc(interview.scheduledAt))
    .limit(1);

  if (!row) return null;

  const startsAt = row.scheduledAt;
  const endsAt = new Date(startsAt.getTime() + row.durationMinutes * 60 * 1000);
  return {
    id: row.id,
    candidateId: row.candidateId,
    name: [row.firstName, row.lastName].filter(Boolean).join(" ").trim(),
    role: [row.jobTitle, row.clientName].filter(Boolean).join(" · "),
    startsAt: startsAt.toISOString(),
    endsAt: endsAt.toISOString(),
    startsInMinutes: Math.max(0, Math.round((startsAt.getTime() - Date.now()) / 60000)),
    durationMinutes: row.durationMinutes,
    kind: row.kind,
    meetingUrl: row.meetingUrl ?? "",
  };
}

/**
 * SLA is measured against each open role's target date — the only deadline the
 * schema actually carries. Roles with no target date are excluded rather than
 * counted as on track.
 */
export async function dashboardSla(organizationId: string) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const todayKey = today.toISOString().slice(0, 10);

  const rows = await db
    .select({ targetDate: job.targetDate })
    .from(job)
    .where(and(eq(job.organizationId, organizationId), eq(job.status, "open")));

  let onTrack = 0;
  let dueToday = 0;
  let overdue = 0;
  for (const row of rows) {
    if (!row.targetDate) continue;
    if (row.targetDate < todayKey) overdue += 1;
    else if (row.targetDate === todayKey) dueToday += 1;
    else onTrack += 1;
  }
  return { onTrack, dueToday, overdue };
}

/**
 * Today's to-do list, derived from the same counts the KPI tiles use. Each
 * entry only appears when its count is non-zero, so the list is never padded.
 */
export async function dashboardPriorities(organizationId: string) {
  const summary = await dashboardSummary(organizationId);
  const sla = await dashboardSla(organizationId);

  const entries = [
    { key: "submissions", count: summary.awaitingReview, tone: "urgent" },
    { key: "screening", count: summary.resumesToReview, tone: "urgent" },
    { key: "overdueRoles", count: sla.overdue, tone: "overdue" },
    { key: "clientsAtRisk", count: summary.clientsAtRisk, tone: "overdue" },
  ];
  return entries.filter((entry) => entry.count > 0);
}

/** The next few scheduled interviews, for the rail list. `range` is the rail
 * toggle: `today` stops at midnight tonight, `week` at seven days out. */
export async function dashboardUpcomingInterviews(
  organizationId: string,
  limit = 3,
  range?: string,
) {
  const now = new Date();
  let until: Date | undefined;
  if (range === "today") {
    until = new Date(now);
    until.setUTCHours(23, 59, 59, 999);
  } else if (range === "week") {
    until = new Date(now.getTime() + WEEK_MS);
  }
  const rows = await db
    .select({
      id: interview.id,
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      jobTitle: job.title,
      kind: interview.kind,
      scheduledAt: interview.scheduledAt,
    })
    .from(interview)
    .leftJoin(candidate, eq(interview.candidateId, candidate.id))
    .leftJoin(job, eq(interview.jobId, job.id))
    .where(
      and(
        eq(interview.organizationId, organizationId),
        eq(interview.status, "scheduled"),
        gte(interview.scheduledAt, now),
        ...(until ? [lt(interview.scheduledAt, until)] : []),
      ),
    )
    .orderBy(asc(interview.scheduledAt))
    .limit(Math.min(Math.max(limit, 1), 20));

  return rows.map((row) => ({
    id: row.id,
    name: [row.firstName, row.lastName].filter(Boolean).join(" ").trim(),
    meta: [row.jobTitle, row.kind].filter(Boolean).join(" · "),
    scheduledAt: row.scheduledAt.toISOString(),
  }));
}

/** Timeline dot per audit severity — colour, so it stays a literal token. */
const SEVERITY_DOT: Record<string, string> = {
  success: "var(--mui-palette-success-main)",
  warning: "var(--mui-palette-surface-warningSoftFg)",
  failure: "var(--mui-palette-error-main)",
};

/** Today's audit entries, newest first — the rail's activity timeline. */
export async function dashboardActivityFeed(organizationId: string, limit = 6) {
  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);

  const rows = await db
    .select({
      id: auditLog.id,
      event: auditLog.event,
      category: auditLog.category,
      severity: auditLog.severity,
      createdAt: auditLog.createdAt,
    })
    .from(auditLog)
    .where(and(eq(auditLog.organizationId, organizationId), gte(auditLog.createdAt, since)))
    .orderBy(desc(auditLog.createdAt))
    .limit(Math.min(Math.max(limit, 1), 50));

  return rows.map((row) => ({
    id: row.id,
    text: row.event,
    category: row.category,
    severity: row.severity,
    dotColor: SEVERITY_DOT[row.severity] ?? SEVERITY_DOT.success,
    at: row.createdAt.toISOString(),
  }));
}

/**
 * The newest candidates with everything the dashboard table shows: role and
 * client from their job, owner, current stage, and their next booked interview.
 * `meta` carries the header counts.
 */
export async function dashboardRecentCandidates(organizationId: string, limit = 6) {
  const rows = await db
    .select({
      id: candidate.id,
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      role: job.title,
      clientName: client.name,
      stage: candidate.startingStage,
      ownerName: user.name,
    })
    .from(candidate)
    .leftJoin(job, eq(candidate.jobId, job.id))
    .leftJoin(client, eq(job.clientId, client.id))
    .leftJoin(user, eq(candidate.ownerId, user.id))
    .where(eq(candidate.organizationId, organizationId))
    .orderBy(desc(candidate.createdAt))
    .limit(Math.min(Math.max(limit, 1), 50));

  const ids = rows.map((row) => row.id);
  // One extra query for the whole page rather than a join that would multiply
  // rows when a candidate has several interviews booked.
  const booked = ids.length
    ? await db
        .select({ candidateId: interview.candidateId, scheduledAt: interview.scheduledAt })
        .from(interview)
        .where(
          and(
            eq(interview.organizationId, organizationId),
            eq(interview.status, "scheduled"),
            gte(interview.scheduledAt, new Date()),
            inArray(interview.candidateId, ids),
          ),
        )
        .orderBy(asc(interview.scheduledAt))
    : [];
  const nextInterview = new Map<string, Date>();
  for (const row of booked) {
    if (row.candidateId && !nextInterview.has(row.candidateId)) {
      nextInterview.set(row.candidateId, row.scheduledAt);
    }
  }

  const weekAgo = new Date(Date.now() - WEEK_MS);
  const inCandidates = eq(candidate.organizationId, organizationId);
  const [addedThisWeek, interviewing] = await Promise.all([
    total(candidate, and(inCandidates, gte(candidate.createdAt, weekAgo))),
    total(candidate, and(inCandidates, eq(candidate.startingStage, "interview"))),
  ]);

  return {
    rows: rows.map((row) => ({
      id: row.id,
      name: [row.firstName, row.lastName].filter(Boolean).join(" ").trim(),
      role: row.role ?? "",
      clientName: row.clientName ?? "",
      stage: row.stage ?? "",
      ownerName: row.ownerName ?? "",
      interviewAt: nextInterview.get(row.id)?.toISOString() ?? "",
    })),
    meta: { addedThisWeek, interviewing },
  };
}

/** Metrics the activity chart can plot, and the `details.stage` they count.
 * `invites` is the odd one out — it comes from the invitation table. */
const ACTIVITY_STAGES = {
  submissions: "submitted",
  interviews: "interview",
  placements: "placed",
} as const;

/**
 * Daily activity across every metric the chart's tabs offer, oldest first. Gaps
 * are filled with zeroes so the axis stays continuous instead of skipping quiet
 * days.
 *
 * Pipeline movement is read from the audit feed's stable `details.stage` (see
 * candidate.controller), so these are real transitions — not a snapshot of who
 * currently sits in a stage.
 */
export async function dashboardActivity(organizationId: string, days = 14) {
  const span = Math.min(Math.max(days, 1), 90);
  // Bucket in UTC on both sides: `to_char` reads the stored (UTC) timestamp, so
  // a local-midnight start would shift every label a day in any zone ahead of
  // UTC — and drop today's rows off the end of the window.
  const start = new Date(Date.now() - (span - 1) * DAY_MS);
  start.setUTCHours(0, 0, 0, 0);

  const auditDay = sql<string>`to_char(${auditLog.createdAt}, 'YYYY-MM-DD')`;
  const auditStage = sql<string>`${auditLog.details}->>'stage'`;
  const inviteDay = sql<string>`to_char(${invitation.createdAt}, 'YYYY-MM-DD')`;

  const [stageRows, inviteRows] = await Promise.all([
    db
      .select({ day: auditDay, stage: auditStage, total: count() })
      .from(auditLog)
      .where(
        and(
          eq(auditLog.organizationId, organizationId),
          eq(auditLog.category, "candidates"),
          gte(auditLog.createdAt, start),
        ),
      )
      .groupBy(auditDay, auditStage),
    db
      .select({ day: inviteDay, total: count() })
      .from(invitation)
      .where(and(eq(invitation.organizationId, organizationId), gte(invitation.createdAt, start)))
      .groupBy(inviteDay),
  ]);

  const stageByDay = new Map(
    stageRows.map((row) => [`${row.day}:${row.stage}`, Number(row.total)]),
  );
  const invitesByDay = new Map(inviteRows.map((row) => [row.day, Number(row.total)]));

  return Array.from({ length: span }, (_, index) => {
    const date = new Date(start.getTime() + index * DAY_MS).toISOString().slice(0, 10);
    const row: Record<string, string | number> = { date, invites: invitesByDay.get(date) ?? 0 };
    for (const [metric, stage] of Object.entries(ACTIVITY_STAGES)) {
      row[metric] = stageByDay.get(`${date}:${stage}`) ?? 0;
    }
    return row;
  });
}
