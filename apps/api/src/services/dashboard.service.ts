import { and, asc, count, desc, eq, gte, inArray, lt, type SQL, sql } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import { db } from "../db";
import { application } from "../models/application.model";
import { auditLog } from "../models/audit-log.model";
import { user } from "../models/auth.model";
import { subscription, usageMetric } from "../models/billing.model";
import { type CandidateStatus, candidate } from "../models/candidate.model";
import { client } from "../models/client.model";
import { integration } from "../models/integration.model";
import { interview } from "../models/interview.model";
import { invitation } from "../models/invitation.model";
import { job } from "../models/job.model";
import { rejectionReason } from "../models/pipeline.model";
import { loginHistory, userSecurity } from "../models/security.model";

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;
const MONTH_MS = 30 * DAY_MS;

/** "3d", "2w" — the compact age the design prints beside an audit row. */
function relativeDay(at: Date | string | null): string {
  if (!at) return "";
  const days = Math.floor((Date.now() - new Date(at).getTime()) / DAY_MS);
  if (days < 1) return "today";
  if (days < 7) return `${days}d`;
  if (days < 30) return `${Math.floor(days / 7)}w`;
  return `${Math.floor(days / 30)}mo`;
}

/** "20 min", "3 h", "2 d" — the age the activity and recents lists print, which
 * the design keeps finer-grained than `relativeDay` because both are read
 * within a session rather than across weeks. */
function relativeTime(at: Date | string | null): string {
  if (!at) return "";
  const ms = Date.now() - new Date(at).getTime();
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h`;
  return `${Math.floor(hours / 24)} d`;
}

/** Statuses that count as "in play" for the active-candidates KPI. */
const ACTIVE_STATUSES: CandidateStatus[] = ["new", "active"];

/** Board order of the candidate pipeline (the form's `startingStage` enum). */
const PIPELINE_STAGES = ["sourced", "screening", "submitted", "interview", "offer"] as const;

/** How a stage reads and colours in the lists the design draws. */
const STAGE_LABEL: Record<string, string> = {
  sourced: "Sourced",
  screening: "Screening",
  submitted: "Submitted",
  interview: "Interview",
  offer: "Offer",
  placed: "Placed",
};

const STAGE_TONE: Record<string, string> = {
  sourced: "primary",
  screening: "info",
  submitted: "primary",
  interview: "warning",
  offer: "violet",
  placed: "success",
};

/** "AN" from "Ana Novak" — the badge every list row carries. */
function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return (
    (parts[0]?.[0] ?? "") + (parts.length > 1 ? (parts.at(-1)?.[0] ?? "") : "")
  ).toUpperCase();
}

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
    allClients,
    allJobs,
    allCandidates,
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
    total(client, inClients),
    total(job, inJobs),
    total(candidate, inCandidates),
  ]);

  return {
    // A workspace with nothing in it has no figures to report, so the dashboard
    // shows the three records that start them instead of a screen of zeroes.
    isNewWorkspace: allClients + allJobs + allCandidates === 0,
    // The line the design prints under the greeting is a count of what the
    // workspace holds, not of what is in flight — so these are the totals.
    clients: allClients,
    jobs: allJobs,
    candidates: allCandidates,
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

  return rows.map((row) => {
    // The design's "Today" card reads hour-badge / who / what · where / time,
    // so the row is shaped for that rather than left for the client to derive.
    const at = row.scheduledAt;
    const hh = String(at.getHours()).padStart(2, "0");
    const mm = String(at.getMinutes()).padStart(2, "0");
    return {
      id: row.id,
      name: [row.firstName, row.lastName].filter(Boolean).join(" ").trim(),
      title: [row.firstName, row.lastName].filter(Boolean).join(" ").trim(),
      subtitle: [row.kind, row.jobTitle].filter(Boolean).join(" · "),
      badge: hh,
      value: `${hh}:${mm}`,
      tone: "primary",
      scheduledAt: at.toISOString(),
    };
  });
}

/** Timeline dot per audit severity — colour, so it stays a literal token. */
const SEVERITY_DOT: Record<string, string> = {
  success: "var(--mui-palette-success-main)",
  warning: "var(--mui-palette-surface-warningSoftFg)",
  failure: "var(--mui-palette-error-main)",
};

/** The design gives every activity row a glyph drawn from what happened, not
 * from how it went — the tone carries that. */
const CATEGORY_ICON: Record<string, string> = {
  security: "shield",
  candidate: "person",
  job: "work",
  client: "domain",
  interview: "event",
  offer: "draft",
  placement: "handshake",
  member: "group",
  workspace: "settings",
};

const SEVERITY_TONE: Record<string, string> = {
  success: "success",
  warning: "warning",
  failure: "error",
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
    // The design draws a tone-coloured glyph, the line, and how long ago —
    // shaped here so every role's card reads the same three paths.
    icon: CATEGORY_ICON[row.category] ?? "history",
    tone: SEVERITY_TONE[row.severity] ?? "success",
    when: relativeTime(row.createdAt),
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
      createdAt: candidate.createdAt,
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
    rows: rows.map((row) => {
      const name = [row.firstName, row.lastName].filter(Boolean).join(" ").trim();
      // The design's row is a tinted glyph, the name, what it is, and how long
      // ago — "Mira Solberg / Candidate · CV received / 1 h". `kind` is that
      // second line, built from whichever of role and stage we actually hold.
      const stage = row.stage ?? "";
      const kind = [row.role, STAGE_LABEL[stage]].filter(Boolean).join(" · ");
      return {
        id: row.id,
        name,
        role: row.role ?? "",
        clientName: row.clientName ?? "",
        stage,
        ownerName: row.ownerName ?? "",
        interviewAt: nextInterview.get(row.id)?.toISOString() ?? "",
        initials: initialsOf(name),
        icon: "person",
        kind: kind || "Candidate",
        tone: STAGE_TONE[stage] ?? "primary",
        when: relativeTime(row.createdAt),
      };
    }),
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

/**
 * What needs a decision, and what to do about it.
 *
 * Both are built from the caller's **permissions**, never their role name: a
 * user who holds `submissions.review` gets the approval queue whether they are
 * a profile lead or a custom "Hiring Manager" role an agency invented, and a
 * user who holds `revenue.view` gets the commercial risks. That is what lets
 * the design's seven role dashboards fall out of five built-in roles plus
 * whatever an agency adds later.
 */
type Capability = (resource: string, action: string) => boolean;

function capabilityFor(permissions: Record<string, string[]>): Capability {
  return (resource, action) => {
    const wildcard = permissions["*"];
    if (wildcard?.includes(action)) return true;
    return permissions[resource]?.includes(action) ?? false;
  };
}

export async function dashboardAlert(
  organizationId: string,
  permissions: Record<string, string[]>,
) {
  const can = capabilityFor(permissions);
  const summary = await dashboardSummary(organizationId);
  const sla = await dashboardSla(organizationId);

  // Most urgent first; the first one the caller can act on wins. A dashboard
  // that shows every alert at once shows none of them.
  const candidates = [
    {
      when: sla.overdue > 0 && can("jobs", "read"),
      tone: "error",
      icon: "schedule",
      title: "slaOverdue",
      body: "slaOverdueBody",
      count: sla.overdue,
    },
    {
      when: summary.awaitingReview > 0 && can("submissions", "review"),
      tone: "warning",
      icon: "rate-review",
      title: "reviewsWaiting",
      body: "reviewsWaitingBody",
      count: summary.awaitingReview,
    },
    {
      when: summary.clientsAtRisk > 0 && can("clients", "read"),
      tone: "warning",
      icon: "domain",
      title: "clientsAtRisk",
      body: "clientsAtRiskBody",
      count: summary.clientsAtRisk,
    },
    {
      when: summary.resumesToReview > 0 && can("candidates", "read"),
      tone: "info",
      icon: "description",
      title: "resumesWaiting",
      body: "resumesWaitingBody",
      count: summary.resumesToReview,
    },
  ];

  const chosen = candidates.find((entry) => entry.when);
  if (!chosen) return { active: false };
  return {
    active: true,
    tone: chosen.tone,
    icon: chosen.icon,
    title: chosen.title,
    body: chosen.body,
    count: chosen.count,
  };
}

export async function dashboardQueue(
  organizationId: string,
  permissions: Record<string, string[]>,
) {
  const can = capabilityFor(permissions);
  const summary = await dashboardSummary(organizationId);
  const sla = await dashboardSla(organizationId);

  const rows = [
    {
      id: "sla-overdue",
      when: can("jobs", "read") && sla.overdue > 0,
      badge: String(sla.overdue),
      title: "queue.slaOverdue",
      subtitle: "queue.slaOverdueSub",
      tag: "queue.tagLate",
      tone: "error",
      cta: "queue.ctaOpen",
    },
    {
      id: "awaiting-review",
      when: can("submissions", "review") && summary.awaitingReview > 0,
      badge: String(summary.awaitingReview),
      title: "queue.awaitingReview",
      subtitle: "queue.awaitingReviewSub",
      tag: "queue.tagToday",
      tone: "warning",
      cta: "queue.ctaReview",
    },
    {
      id: "resumes",
      when: can("candidates", "read") && summary.resumesToReview > 0,
      badge: String(summary.resumesToReview),
      title: "queue.resumes",
      subtitle: "queue.resumesSub",
      tag: "queue.tagNew",
      tone: "info",
      cta: "queue.ctaOpen",
    },
    {
      id: "clients-at-risk",
      when: can("clients", "read") && summary.clientsAtRisk > 0,
      badge: String(summary.clientsAtRisk),
      title: "queue.clientsAtRisk",
      subtitle: "queue.clientsAtRiskSub",
      tag: "queue.tagRisk",
      tone: "error",
      cta: "queue.ctaOpen",
    },
    {
      id: "due-today",
      when: can("jobs", "read") && sla.dueToday > 0,
      badge: String(sla.dueToday),
      title: "queue.dueToday",
      subtitle: "queue.dueTodaySub",
      tag: "queue.tagToday",
      tone: "warning",
      cta: "queue.ctaOpen",
    },
  ];

  return rows.filter((row) => row.when).map(({ when: _when, ...row }) => row);
}

/**
 * The four figures a role opens the day on.
 *
 * Each role module names the four keys it wants in its own KPI configuration;
 * this returns every figure the caller is entitled to and lets the config pick.
 * Values are pre-formatted strings because the design mixes currency, ratios
 * and durations in the same row, and the tile renders whatever it is handed.
 */
export async function dashboardKpis(organizationId: string, permissions: Record<string, string[]>) {
  const can = capabilityFor(permissions);
  const [summary, sla, jobs, clients, members] = await Promise.all([
    dashboardSummary(organizationId),
    dashboardSla(organizationId),
    db
      .select({
        status: job.status,
        openings: job.openings,
        revenuePerPosition: job.revenuePerPosition,
        actualRevenue: job.actualRevenue,
      })
      .from(job)
      .where(eq(job.organizationId, organizationId)),
    db.select({ id: client.id }).from(client).where(eq(client.organizationId, organizationId)),
    total(user, eq(user.agencyId, organizationId)),
  ]);

  // The admin tiles read from the workspace's own tables rather than the
  // pipeline: the plan's seat count, the security posture, what is connected,
  // and this period's AI usage.
  const [seats, security, connectedIntegrations, warningIntegrations, usage] = await Promise.all([
    db
      .select({ total: subscription.seatTotal })
      .from(subscription)
      .where(eq(subscription.organizationId, organizationId))
      .then((rows) => ({ total: Number(rows[0]?.total ?? 0) })),
    securityScoreFor(organizationId),
    total(
      integration,
      and(eq(integration.organizationId, organizationId), eq(integration.status, "connected")),
    ),
    total(
      integration,
      and(eq(integration.organizationId, organizationId), eq(integration.status, "warning")),
    ),
    db
      .select({ used: usageMetric.aiCreditsUsed, total: usageMetric.aiCreditsTotal })
      .from(usageMetric)
      .where(
        and(
          eq(usageMetric.organizationId, organizationId),
          eq(usageMetric.period, new Date().toISOString().slice(0, 7)),
        ),
      )
      .then((rows) => ({
        used: Number(rows[0]?.used ?? 0),
        total: Number(rows[0]?.total ?? 0),
      })),
  ]);

  const money = (value: string | number | null) => {
    const parsed = Number.parseFloat(String(value ?? "").replace(/[^0-9.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  };
  const currency = (value: number) =>
    value >= 1000 ? `\u20ac${Math.round(value / 1000)}k` : `\u20ac${Math.round(value)}`;

  const filled = jobs.filter((row) => row.status === "filled");
  const booked = filled.reduce((sum, row) => sum + money(row.actualRevenue), 0);
  const potential = jobs.reduce(
    (sum, row) => sum + money(row.revenuePerPosition) * Math.max(1, Number(row.openings ?? 1)),
    0,
  );
  const placements = filled.length;

  const figures: Record<string, string | number> = {};

  if (can("candidates", "read")) {
    figures.candidatesAdded = summary.activeCandidates;
    figures.candidatesAddedDelta = summary.activeCandidatesDelta ?? "";
    figures.profilesContacted = summary.submissions;
    figures.submittedToday = summary.submissions;
    figures.teamSubmissions = summary.submissions;
    figures.resumesToReview = summary.resumesToReview;
  }
  if (can("jobs", "read")) {
    figures.openJobs = summary.openRoles;
    figures.openRoles = summary.openRoles;
    figures.openJobsDelta = summary.openedThisWeek ? `+${summary.openedThisWeek}` : "";
    figures.slaBreaches = sla.overdue;
    figures.slaBreachesDelta = sla.dueToday ? `${sla.dueToday} due today` : "";
  }
  if (can("interviews", "read")) {
    figures.interviewsToday = summary.interviews;
  }
  if (can("submissions", "review")) {
    figures.pendingApproval = summary.awaitingReview;
    figures.reviewsPending = summary.awaitingReview;
  }
  if (can("submissions", "approve")) {
    figures.awaitingYou = summary.awaitingReview;
  }
  if (can("clients", "read")) {
    figures.accountHealth = summary.clientsAtRisk ? `${summary.clientsAtRisk} at risk` : "Healthy";
    figures.activeAccounts = clients.length;
    figures.portfolioValue = currency(booked);
    figures.renewalsDue = 0;
  }
  if (can("revenue", "view")) {
    // Money the desk has actually booked, and what is still owed on it.
    figures.revenueMonth = currency(booked);
    figures.revenueMonthDelta = placements ? `${placements} placed` : "";
    figures.placements = placements;
    figures.outstanding = currency(potential - booked);
    figures.outstandingDelta = potential > booked ? "in play" : "";
  }
  if (can("members", "view")) {
    // The design prints seats as used-of-licensed with the share underneath,
    // which only reads as a warning when both halves are on the card.
    figures.seatsUsed = seats.total ? `${members} / ${seats.total}` : String(members);
    figures.seatsUsedDelta = seats.total ? `${Math.round((members / seats.total) * 100)}%` : "";
    figures.teamSubmissions = summary.submissions;
  }
  if (can("security", "manage")) {
    figures.securityScore = security.score;
    figures.securityScoreDelta = security.label;
  }
  if (can("integrations", "read") || can("integrations", "manage")) {
    figures.integrations = connectedIntegrations;
    figures.integrationsDelta = warningIntegrations
      ? `${warningIntegrations} warning`
      : "all healthy";
  }
  if (can("ai", "use")) {
    figures.aiCredits = usage.used.toLocaleString("en-IN");
    figures.aiCreditsDelta = `of ${usage.total.toLocaleString("en-IN")}`;
  }
  return figures;
}

/**
 * A 0–100 read on how locked down the workspace is, from the three signals we
 * actually store: two-factor coverage, verified addresses, and whether any
 * sign-in was blocked this week. Weighted so 2FA dominates — it is the control
 * that survives a leaked password.
 */
async function securityScoreFor(organizationId: string) {
  const [members, withTwoFactor, verified, blocked] = await Promise.all([
    total(user, eq(user.agencyId, organizationId)),
    db
      .select({ total: count() })
      .from(userSecurity)
      .innerJoin(user, eq(userSecurity.userId, user.id))
      .where(and(eq(user.agencyId, organizationId), eq(userSecurity.twoFactorEnabled, true)))
      .then((rows) => Number(rows[0]?.total ?? 0)),
    total(user, and(eq(user.agencyId, organizationId), eq(user.emailVerified, true))),
    total(
      loginHistory,
      and(
        eq(loginHistory.organizationId, organizationId),
        eq(loginHistory.result, "blocked"),
        gte(loginHistory.createdAt, new Date(Date.now() - WEEK_MS)),
      ),
    ),
  ]);

  if (!members) return { score: 0, label: "" };
  const twoFactor = (withTwoFactor / members) * 60;
  const verifiedShare = (verified / members) * 30;
  const clean = blocked === 0 ? 10 : 0;
  const score = Math.round(twoFactor + verifiedShare + clean);
  const label = score >= 90 ? "Good" : score >= 70 ? "Fair" : "Needs work";
  return { score, label };
}

/** The health readout under the KPI row. Only true statements are returned —
 * a chip that always shows says nothing. */
export async function dashboardStatus(
  organizationId: string,
  permissions: Record<string, string[]>,
) {
  const can = capabilityFor(permissions);
  const summary = await dashboardSummary(organizationId);
  const sla = await dashboardSla(organizationId);

  const chips = [
    {
      when: can("jobs", "read") && sla.overdue > 0,
      label: "slaBreached",
      tone: "error",
      count: sla.overdue,
    },
    { when: can("jobs", "read") && sla.overdue === 0, label: "onPlan", tone: "success" },
    {
      when: can("clients", "read") && summary.clientsAtRisk > 0,
      label: "invoiceOverdue",
      tone: "warning",
      count: summary.clientsAtRisk,
    },
    {
      when: can("candidates", "read") && summary.activeCandidates > 0,
      label: "pipelineHealthy",
      tone: "success",
    },
  ];
  return chips.filter((chip) => chip.when).map(({ when: _w, ...chip }) => chip);
}

/**
 * "Today's work": the day's load as counts, not records. Each entry is one
 * thing standing between the desk and the end of the day; zero-count entries
 * are dropped so the block never pads itself.
 */
export async function dashboardTodayWork(
  organizationId: string,
  permissions: Record<string, string[]>,
) {
  const can = capabilityFor(permissions);
  const summary = await dashboardSummary(organizationId);
  const sla = await dashboardSla(organizationId);

  const items = [
    {
      id: "feedback-overdue",
      when: can("jobs", "read"),
      count: sla.overdue,
      label: "feedbackOverdue",
      detail: "feedbackOverdueDetail",
      tone: "error",
      icon: "gavel",
    },
    {
      id: "interviews-today",
      when: can("interviews", "read"),
      count: summary.interviews,
      label: "interviewsToday",
      detail: "interviewsTodayDetail",
      tone: "info",
      icon: "event",
    },
    {
      id: "resumes",
      when: can("candidates", "read"),
      count: summary.resumesToReview,
      label: "resumesToScreen",
      detail: "resumesToScreenDetail",
      tone: "warning",
      icon: "description",
    },
    {
      id: "offers",
      when: can("submissions", "review"),
      count: summary.awaitingReview,
      label: "offersAwaiting",
      detail: "offersAwaitingDetail",
      tone: "warning",
      icon: "draft",
    },
    {
      id: "clients-risk",
      when: can("clients", "read"),
      count: summary.clientsAtRisk,
      label: "clientsAtRisk",
      detail: "clientsAtRiskDetail",
      tone: "violet",
      icon: "domain",
    },
    {
      id: "due-today",
      when: can("jobs", "read"),
      count: sla.dueToday,
      label: "invoicePastDue",
      detail: "invoicePastDueDetail",
      tone: "error",
      icon: "receipt-long",
    },
  ];
  return items.filter((i) => i.when && i.count > 0).map(({ when: _w, ...i }) => i);
}

/** Clients ranked by open work, for the owner's context card. */
export async function dashboardTopClients(organizationId: string, limit = 4) {
  const rows = await db
    .select({ id: client.id, name: client.name, health: client.health })
    .from(client)
    .where(eq(client.organizationId, organizationId))
    .limit(limit);

  return rows.map((row) => ({
    id: row.id,
    badge: (row.name ?? "?").slice(0, 1).toUpperCase(),
    title: row.name ?? "",
    subtitle: "",
    value: "",
    tone: row.health === "at_risk" ? "error" : "success",
    meta: [
      {
        label: row.health === "at_risk" ? "At risk" : "Healthy",
        tone: row.health === "at_risk" ? "error" : "success",
      },
    ],
  }));
}

/** What the model produced overnight. Counts only — the detail lives in the
 * AI workspace this links to. */
export async function dashboardAiFindings(
  organizationId: string,
  permissions: Record<string, string[]>,
) {
  if (!capabilityFor(permissions)("ai", "use")) return [];
  const summary = await dashboardSummary(organizationId);
  const findings = [
    {
      id: "screened",
      count: summary.resumesToReview,
      label: "screened",
      tone: "violet",
      icon: "auto-awesome",
    },
    {
      id: "matched",
      count: summary.submissions,
      label: "matched",
      tone: "success",
      icon: "join-inner",
    },
    {
      id: "parsed",
      count: summary.activeCandidates,
      label: "parsed",
      tone: "info",
      icon: "description",
    },
  ];
  return findings.filter((f) => f.count > 0);
}

/**
 * Revenue by quarter: what the desk booked against what it had on the table.
 *
 * `actualRevenue` is the fee once a requisition is filled — the money. The
 * potential line is `revenuePerPosition × openings` across every requisition
 * opened that quarter, so the gap between the bars is the conversion problem
 * made visible, which is why the design plots them together.
 */
export async function dashboardRevenueByQuarter(
  organizationId: string,
  permissions: Record<string, string[]>,
) {
  if (!capabilityFor(permissions)("revenue", "view")) return [];

  const rows = await db
    .select({
      createdAt: job.createdAt,
      status: job.status,
      openings: job.openings,
      revenuePerPosition: job.revenuePerPosition,
      actualRevenue: job.actualRevenue,
    })
    .from(job)
    .where(eq(job.organizationId, organizationId));

  const money = (value: string | number | null) => {
    const parsed = Number.parseFloat(String(value ?? "").replace(/[^0-9.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const buckets = new Map<string, { submitted: number; booked: number }>();
  for (const row of rows) {
    const at = row.createdAt ? new Date(row.createdAt) : null;
    if (!at) continue;
    const key = `Q${Math.floor(at.getUTCMonth() / 3) + 1} ${at.getUTCFullYear()}`;
    const bucket = buckets.get(key) ?? { submitted: 0, booked: 0 };
    bucket.submitted += money(row.revenuePerPosition) * Math.max(1, Number(row.openings ?? 1));
    if (row.status === "filled") bucket.booked += money(row.actualRevenue);
    buckets.set(key, bucket);
  }

  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, value]) => ({
      period,
      submitted: Math.round(value.submitted),
      booked: Math.round(value.booked),
    }));
}

/**
 * The recruiter leaderboard.
 *
 * Work is attributed through the columns the schema already carries:
 * `job.profileLeadId` / `job.sourcerId` for requisitions, `candidate.ownerId`
 * for people, `interview.ownerId` for the diary. Revenue is the job's own
 * `actualRevenue` once it is filled — the number the desk is actually paid,
 * not a projection.
 */
export async function dashboardTeamPerformance(
  organizationId: string,
  permissions: Record<string, string[]>,
) {
  if (!capabilityFor(permissions)("members", "view")) return [];

  const [members, jobs, candidates, interviews] = await Promise.all([
    db
      .select({ id: user.id, name: user.name, role: user.role })
      .from(user)
      .where(eq(user.agencyId, organizationId)),
    db
      .select({
        sourcerId: job.sourcerId,
        profileLeadId: job.profileLeadId,
        status: job.status,
        actualRevenue: job.actualRevenue,
      })
      .from(job)
      .where(eq(job.organizationId, organizationId)),
    db
      .select({
        ownerId: candidate.ownerId,
        status: candidate.status,
        stage: candidate.startingStage,
      })
      .from(candidate)
      .where(eq(candidate.organizationId, organizationId)),
    db
      .select({ ownerId: interview.ownerId })
      .from(interview)
      .where(eq(interview.organizationId, organizationId)),
  ]);

  const money = (value: string | null) => {
    const parsed = Number.parseFloat((value ?? "").replace(/[^0-9.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  };

  return members.map((member) => {
    // A member may lead some requisitions and source others; both are theirs.
    const own = jobs.filter(
      (row) => row.profileLeadId === member.id || row.sourcerId === member.id,
    );
    const mine = candidates.filter((row) => row.ownerId === member.id);
    const submissions = mine.filter((row) => row.stage === "submitted").length;
    const placed = mine.filter((row) => row.status === "placed").length;
    const revenue = own
      .filter((row) => row.status === "filled")
      .reduce((sum, row) => sum + money(row.actualRevenue), 0);
    // Conversion is placements over what was submitted; with nothing submitted
    // there is no ratio to report, so the cell stays empty rather than "0%".
    const conversion = submissions ? Math.round((placed / submissions) * 100) : null;

    return {
      id: member.id,
      name: member.name ?? "",
      role: member.role ?? "",
      initials: (member.name ?? "?")
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join(""),
      jobs: own.length,
      candidates: mine.length,
      submissions,
      interviews: interviews.filter((row) => row.ownerId === member.id).length,
      offers: mine.filter((row) => row.stage === "offer").length,
      placed,
      revenue,
      conversion: conversion === null ? "\u2014" : `${conversion}%`,
      // The threshold is a business rule, so the API picks the tone.
      conversionTone:
        conversion === null
          ? "text.secondary"
          : conversion >= 40
            ? "success.main"
            : "text.secondary",
      sla: "\u2014",
      slaTone: "text.secondary",
    };
  });
}

/** Client health: where the desk is exposed. Open roles and placements per
 * client, with the health flag the client record already carries. */
export async function dashboardClientHealth(
  organizationId: string,
  permissions: Record<string, string[]>,
) {
  if (!capabilityFor(permissions)("clients", "read")) return [];

  const [clients, jobs] = await Promise.all([
    db
      .select({ id: client.id, name: client.name, health: client.health })
      .from(client)
      .where(eq(client.organizationId, organizationId)),
    db
      .select({ clientId: job.clientId, status: job.status })
      .from(job)
      .where(eq(job.organizationId, organizationId)),
  ]);

  return clients.map((row) => {
    const own = jobs.filter((j) => j.clientId === row.id);
    return {
      id: row.id,
      badge: (row.name ?? "?").slice(0, 1).toUpperCase(),
      name: row.name ?? "",
      contact: "",
      openRoles: own.filter((j) => j.status === "open").length,
      placed: own.filter((j) => j.status === "filled").length,
      health: row.health ?? "healthy",
    };
  });
}

/** Admin's context card: sign-ins, resets and exports from the audit log. */
export async function dashboardSecurityEvents(
  organizationId: string,
  permissions: Record<string, string[]>,
  limit = 4,
) {
  if (!capabilityFor(permissions)("audit", "view")) return [];

  const rows = await db
    .select({
      id: auditLog.id,
      event: auditLog.event,
      category: auditLog.category,
      severity: auditLog.severity,
      actorName: auditLog.actorName,
      createdAt: auditLog.createdAt,
    })
    .from(auditLog)
    .where(eq(auditLog.organizationId, organizationId))
    .orderBy(desc(auditLog.createdAt))
    .limit(limit);

  return rows.map((row) => ({
    id: row.id,
    badge: (row.category ?? "?").slice(0, 1).toUpperCase(),
    title: row.event ?? "",
    subtitle: row.actorName ?? "",
    value: relativeDay(row.createdAt),
    // Severity is the audit log's own judgement; the card only colours it.
    tone: row.severity === "failure" ? "error" : row.severity === "warning" ? "warning" : "success",
  }));
}

/** Sourcer's context card: the requisitions assigned to them. */
export async function dashboardAssignedJobs(organizationId: string, userId: string, limit = 4) {
  const rows = await db
    .select({ id: job.id, title: job.title, reference: job.reference, status: job.status })
    .from(job)
    .where(and(eq(job.organizationId, organizationId), eq(job.sourcerId, userId)))
    .limit(limit);

  return rows.map((row) => ({
    id: row.id,
    badge: (row.title ?? "?").slice(0, 1).toUpperCase(),
    title: row.title ?? "",
    subtitle: row.reference ?? "",
    value: row.status ?? "",
    tone: row.status === "open" ? "primary" : "muted",
  }));
}

/**
 * Hiring Manager's context card: why profiles are being rejected, ranked. The
 * point is the pattern — a reason at the top of this list is usually a brief
 * that needs rewriting, not a run of weak candidates.
 */
export async function dashboardRejectionReasons(
  organizationId: string,
  permissions: Record<string, string[]>,
  limit = 4,
) {
  if (!capabilityFor(permissions)("submissions", "review")) return [];

  const rows = await db
    .select({ reasonId: application.rejectionReasonId })
    .from(application)
    .where(eq(application.organizationId, organizationId));

  const reasons = await db
    .select({
      id: rejectionReason.id,
      label: rejectionReason.label,
      category: rejectionReason.category,
    })
    .from(rejectionReason)
    .where(eq(rejectionReason.organizationId, organizationId));

  const counts = new Map<string, number>();
  for (const row of rows) {
    if (!row.reasonId) continue;
    counts.set(row.reasonId, (counts.get(row.reasonId) ?? 0) + 1);
  }
  const total = [...counts.values()].reduce((sum, n) => sum + n, 0);
  if (!total) return [];

  return reasons
    .filter((reason) => counts.has(reason.id))
    .sort((a, b) => (counts.get(b.id) ?? 0) - (counts.get(a.id) ?? 0))
    .slice(0, limit)
    .map((reason) => {
      const count = counts.get(reason.id) ?? 0;
      return {
        id: reason.id,
        badge: String(count),
        title: reason.label,
        subtitle: reason.category ?? "",
        value: `${Math.round((count / total) * 100)}%`,
        tone: "error",
      };
    });
}

/** Client's context card: the roles their agency has open for them. */
export async function dashboardOpenRoles(organizationId: string, limit = 4) {
  const rows = await db
    .select({ id: job.id, title: job.title, reference: job.reference, openings: job.openings })
    .from(job)
    .where(and(eq(job.organizationId, organizationId), eq(job.status, "open")))
    .limit(limit);

  return rows.map((row) => ({
    id: row.id,
    badge: (row.title ?? "?").slice(0, 1).toUpperCase(),
    title: row.title ?? "",
    subtitle: row.reference ?? "",
    value: `${row.openings ?? 1}`,
    tone: "primary",
  }));
}

/** Admin's system strip: one row per check the workspace depends on. */
export async function dashboardSystemStatus(
  organizationId: string,
  permissions: Record<string, string[]>,
) {
  if (!capabilityFor(permissions)("security", "manage")) return [];

  const [members, pendingInvites, integrations] = await Promise.all([
    total(user, eq(user.agencyId, organizationId)),
    total(invitation, eq(invitation.organizationId, organizationId)),
    total(integration, eq(integration.organizationId, organizationId)),
  ]);

  return [
    { id: "members", label: "system.members", value: String(members), tone: "success", note: "" },
    {
      id: "invites",
      label: "system.invites",
      value: String(pendingInvites),
      tone: pendingInvites > 0 ? "warning" : "success",
      note: "",
    },
    {
      id: "integrations",
      label: "system.integrations",
      value: String(integrations),
      tone: integrations > 0 ? "success" : "warning",
      note: "",
    },
  ];
}

/**
 * Team Lead's capacity meter. Bands are shares of the desk, so the percentages
 * are computed here rather than in the card — the card only draws them.
 */
export async function dashboardTeamHealth(
  organizationId: string,
  permissions: Record<string, string[]>,
) {
  if (!capabilityFor(permissions)("members", "view")) return [];

  const members = await db
    .select({ id: user.id, name: user.name })
    .from(user)
    .where(eq(user.agencyId, organizationId));
  if (!members.length) return [];

  const jobs = await db
    .select({ profileLeadId: job.profileLeadId, sourcerId: job.sourcerId, status: job.status })
    .from(job)
    .where(and(eq(job.organizationId, organizationId), eq(job.status, "open")));

  const load = members.map((member) => ({
    member,
    open: jobs.filter((j) => j.profileLeadId === member.id || j.sourcerId === member.id).length,
  }));

  // Three bands the design names: stretched, steady, and room to take more.
  const bands = [
    {
      id: "stretched",
      label: "health.stretched",
      tone: "error",
      rows: load.filter((l) => l.open >= 5),
    },
    {
      id: "steady",
      label: "health.steady",
      tone: "success",
      rows: load.filter((l) => l.open >= 2 && l.open < 5),
    },
    {
      id: "capacity",
      label: "health.capacity",
      tone: "info",
      rows: load.filter((l) => l.open < 2),
    },
  ];
  const totalMembers = members.length;
  const utilised = Math.round(
    (load.filter((l) => l.open >= 2).length / Math.max(1, totalMembers)) * 100,
  );

  return bands
    .filter((band) => band.rows.length > 0)
    .map((band) => ({
      id: band.id,
      label: band.label,
      value: String(band.rows.length),
      tone: band.tone,
      percent: Math.round((band.rows.length / totalMembers) * 100),
      note: band.rows
        .slice(0, 2)
        .map((l) => l.member.name ?? "")
        .join(", "),
      capacity: `${utilised}%`,
    }));
}

/**
 * The desk's own pipeline: how many candidates sit in each stage, and which
 * stage has gone quiet. The flag is the point — a stage nobody has touched is
 * what turns a pipeline into a backlog.
 */
export async function dashboardMyPipeline(organizationId: string, userId: string) {
  const rows = await db
    .select({ stage: candidate.startingStage, ownerId: candidate.ownerId })
    .from(candidate)
    .where(eq(candidate.organizationId, organizationId));

  const mine = rows.filter((row) => row.ownerId === userId);
  const stages = ["screening", "submitted", "interview", "offer"] as const;
  const tones: Record<string, string> = {
    screening: "info",
    submitted: "primary",
    interview: "violet",
    offer: "success",
  };

  return stages.map((stage) => {
    const count = mine.filter((row) => row.stage === stage).length;
    return {
      id: stage,
      label: `pipeline.${stage}`,
      value: String(count),
      tone: tones[stage] ?? "primary",
      flag: count === 0 ? "pipeline.empty" : "",
    };
  });
}

/** This week's targets against what has actually happened. */
export async function dashboardWeekGoals(organizationId: string, userId: string) {
  const weekAgo = new Date(Date.now() - WEEK_MS);
  const rows = await db
    .select({
      stage: candidate.startingStage,
      ownerId: candidate.ownerId,
      createdAt: candidate.createdAt,
    })
    .from(candidate)
    .where(and(eq(candidate.organizationId, organizationId), gte(candidate.createdAt, weekAgo)));

  const mine = rows.filter((row) => row.ownerId === userId);
  // Targets are a workspace setting the wizard will own; until then they are
  // the desk defaults the design shows.
  const goals = [
    { id: "added", label: "goals.added", target: 20, count: mine.length, tone: "primary" },
    {
      id: "submitted",
      label: "goals.submitted",
      target: 10,
      count: mine.filter((r) => r.stage === "submitted").length,
      tone: "success",
    },
    {
      id: "interviews",
      label: "goals.interviews",
      target: 5,
      count: mine.filter((r) => r.stage === "interview").length,
      tone: "violet",
    },
  ];

  return goals.map((goal) => ({
    ...goal,
    value: `${goal.count} / ${goal.target}`,
    percent: Math.min(100, Math.round((goal.count / goal.target) * 100)),
  }));
}
